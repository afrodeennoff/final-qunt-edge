import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { whop, parseWhopDate } from '@/lib/whop'
import type { PrismaClient } from '@/prisma/generated/prisma'
import { logger } from '@/lib/logger'
import { subscriptionManager } from './subscription-manager'
import { paymentService } from './payment-service'
import {
  validateMembership,
  validatePayment,
  validateRefund,
  validateInvoice,
  type MembershipPayload,
  type PaymentPayload,
  type RefundPayload,
  type InvoicePayload,
} from './webhook-schemas'
import crypto from 'crypto'

interface WebhookEvent {
  id: string
  type: string
  data: unknown
  created_at?: number
}

/**
 * Extends the Whop SDK's Membership.User type with email,
 * which is present in the API response but missing from the SDK type definition.
 */
interface WhopMembershipUser {
  id: string
  name: string | null
  username: string
  email?: string
}

interface WebhookProcessingResult {
  success: boolean
  eventType: string
  processed: boolean
  alreadyProcessed?: boolean
  error?: string
  retries?: number
}

export class WebhookService {
  private static instance: WebhookService
  private processingQueue: Map<string, Promise<WebhookProcessingResult>>
  private retryAttempts: Map<string, number>
  private readonly maxRetryAttemptEntries = 10_000
  private stats = {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    duplicateEvents: 0,
    retryCount: 0,
    eventsByType: new Map<string, number>(),
  }
  private readonly maxRetryAttempts = 3

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService()
    }
    return WebhookService.instance
  }

  constructor() {
    this.processingQueue = new Map()
    this.retryAttempts = new Map()
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(payload)
      const digest = hmac.digest('hex')

      if (signature.length !== digest.length) {
        return false
      }

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(digest)
      )
    } catch (error) {
      logger.error('[WebhookService] Signature verification failed', { error })
      return false
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookProcessingResult> {
    this.stats.totalEvents += 1
    this.stats.eventsByType.set(
      event.type,
      (this.stats.eventsByType.get(event.type) ?? 0) + 1
    )

    const queueKey = `${event.id}:${event.type}`

    if (this.processingQueue.has(queueKey)) {
      this.stats.duplicateEvents += 1
      logger.info('[WebhookService] Event already being processed', { eventId: event.id, eventType: event.type })
      return {
        success: true,
        eventType: event.type,
        processed: false,
        alreadyProcessed: true,
      }
    }

    const processingPromise = this.processEvent(event)
    this.processingQueue.set(queueKey, processingPromise)

    try {
      const result = await processingPromise
      return result
    } finally {
      this.processingQueue.delete(queueKey)
    }
  }

  private async processEvent(event: WebhookEvent): Promise<WebhookProcessingResult> {
    let lockAcquired = false

    try {
      lockAcquired = await this.acquireWebhookLock(prisma, event)
      if (!lockAcquired) {
        this.stats.duplicateEvents += 1
        logger.info('[WebhookService] Duplicate webhook skipped', {
          eventType: event.type,
          eventId: event.id,
        })
        return {
          success: true,
          eventType: event.type,
          processed: false,
          alreadyProcessed: true,
        }
      }

      logger.info('[WebhookService] Processing webhook event', {
        eventType: event.type,
        eventId: event.id,
      })

      const result = await this.processEventWithRetry(event, prisma)

      await this.logWebhookEvent({
        eventId: event.id,
        eventType: event.type,
        success: result.success,
        processed: result.processed,
        error: result.error,
        retries: result.retries ?? 0,
      })

      if (result.success) {
        this.stats.successfulEvents += 1
        await this.finalizeWebhookLock(prisma, event, result)
      } else {
        this.stats.failedEvents += 1
        logger.error('[WebhookService] Event reached terminal failure', {
          eventId: event.id,
          eventType: event.type,
          error: result.error,
        })
        await this.releaseWebhookLock(prisma, event)
      }
      return result
    } catch (error) {
      this.stats.failedEvents += 1
      logger.error('[WebhookService] Event processing failed', {
        eventType: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      if (lockAcquired) {
        await this.releaseWebhookLock(prisma, event)
      }

      await this.logWebhookEvent({
        eventId: event.id,
        eventType: event.type,
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retries: 0,
      })

      return {
        success: false,
        eventType: event.type,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async processEventWithRetry(
    event: WebhookEvent,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    let attempt = 0
    let lastResult: WebhookProcessingResult = {
      success: false,
      eventType: event.type,
      processed: false,
      error: 'Unknown error',
    }

    while (attempt < this.maxRetryAttempts) {
      attempt += 1
      lastResult = await this.handleEventByType(event, prisma)

      if (lastResult.success || !this.isRetryableEvent(event.type, lastResult.error)) {
        return { ...lastResult, retries: attempt }
      }

      if (attempt < this.maxRetryAttempts) {
        this.stats.retryCount += 1
        const delayMs = this.getBackoffMs(attempt)
        logger.warn('[WebhookService] Retrying webhook event', {
          eventId: event.id,
          eventType: event.type,
          attempt,
          delayMs,
          reason: lastResult.error,
        })
        await this.sleep(delayMs)
      }
    }

    return { ...lastResult, retries: attempt }
  }

  private isRetryableEvent(eventType: string, error?: string): boolean {
    if (!error) return false

    const retryableEventTypes = new Set([
      'membership.activated',
      'membership.updated',
      'membership.deactivated',
      'payment.succeeded',
      'payment.failed',
      'invoice.created',
      'invoice.paid',
      'invoice.payment_failed',
    ])

    if (!retryableEventTypes.has(eventType)) {
      return false
    }

    const normalized = error.toLowerCase()
    return (
      normalized.includes('timeout') ||
      normalized.includes('network') ||
      normalized.includes('temporar') ||
      normalized.includes('connection') ||
      normalized.includes('fetch')
    )
  }

  private getBackoffMs(attempt: number): number {
    return Math.min(500 * 2 ** (attempt - 1), 5_000)
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async acquireWebhookLock(_prisma: PrismaClient, event: WebhookEvent): Promise<boolean> {
    try {
      await prisma.processedWebhook.create({
        data: {
          webhookId: event.id,
          type: event.type,
          processedAt: new Date(),
          metadata: JSON.stringify({
            status: 'processing',
          }),
        },
      })

      return true
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        return false
      }
      throw error
    }
  }

  private async finalizeWebhookLock(
    _prisma: PrismaClient,
    event: WebhookEvent,
    result: WebhookProcessingResult,
  ): Promise<void> {
    await prisma.processedWebhook.update({
      where: {
        webhookId_type: {
          webhookId: event.id,
          type: event.type,
        },
      },
      data: {
        processedAt: new Date(),
        metadata: JSON.stringify({
          status: result.success ? 'completed' : 'failed',
          processed: result.processed,
          error: result.error ?? null,
        }),
      },
    })
  }

  private async releaseWebhookLock(_prisma: PrismaClient, event: WebhookEvent): Promise<void> {
    await prisma.processedWebhook.deleteMany({
      where: {
        webhookId: event.id,
        type: event.type,
      },
    })
  }

  private async handleEventByType(
    event: WebhookEvent,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    const { type, data } = event

    switch (type) {
      case 'membership.activated':
        return await this.handleMembershipActivated(validateMembership(data), prisma)

      case 'membership.deactivated':
        return await this.handleMembershipDeactivated(validateMembership(data), prisma)

      case 'membership.updated':
        return await this.handleMembershipUpdated(validateMembership(data), prisma)

      case 'membership.trialing':
        return await this.handleMembershipTrialing(validateMembership(data), prisma)

      case 'payment.succeeded':
        return await this.handlePaymentSucceeded(validatePayment(data), prisma)

      case 'payment.failed':
        return await this.handlePaymentFailed(validatePayment(data), prisma)

      case 'payment.refunded':
        return await this.handlePaymentRefunded(validateRefund(data), prisma)

      case 'payment.partially_refunded':
        return await this.handlePaymentPartiallyRefunded(validateRefund(data), prisma)

      case 'invoice.created':
        return await this.handleInvoiceCreated(validateInvoice(data), prisma)

      case 'invoice.paid':
        return await this.handleInvoicePaid(validateInvoice(data), prisma)

      case 'invoice.payment_failed':
        return await this.handleInvoicePaymentFailed(validateInvoice(data), prisma)

      default:
        logger.warn('[WebhookService] Unhandled event type', { eventType: type })
        return {
          success: true,
          eventType: type,
          processed: false,
        }
    }
  }

  private async handleMembershipActivated(
    membership: MembershipPayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      if (!membership.user?.email) {
        return {
          success: false,
          eventType: 'membership.activated',
          processed: false,
          error: 'No user email in membership data',
        }
      }

      const email = membership.user.email.toLowerCase().trim();
      const metadata = membership.metadata || {} as Record<string, unknown>
      const userId = metadata.user_id as string | undefined
      const type = (metadata.type as string) || 'individual'
      const planName = String(metadata.plan || membership.product?.title || 'PLUS')

      const interval = planName.toLowerCase().includes('monthly') ? 'month' :
        planName.toLowerCase().includes('quarterly') ? 'quarter' :
          planName.toLowerCase().includes('yearly') ? 'year' :
            planName.toLowerCase().includes('lifetime') ? 'lifetime' : 'month'

      const isTrial = membership.status === 'trialing'

      // Handle different types of memberships
      if (type === 'team') {
        return await this.handleTeamMembershipActivated(membership, email, userId, planName, interval, prisma);
      } else if (type === 'business') {
        return await this.handleBusinessMembershipActivated(membership, email, userId, planName, interval, prisma);
      }

      // Default: Individual membership
      await subscriptionManager.createSubscription({
        userId: userId || membership.user?.id || crypto.randomUUID(),
        email,
        plan: planName,
        interval,
        whopMembershipId: membership.id,
        trial: isTrial,
        metadata: {
          whopMembershipId: membership.id,
          activatedAt: parseWhopDate(membership.created_at)?.toISOString() || new Date().toISOString(),
        },
      })

      logger.info('[WebhookService] Membership activated', {
        email,
        plan: planName,
        interval,
        isTrial,
      })

      return {
        success: true,
        eventType: 'membership.activated',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle membership.activated', { error })
      return {
        success: false,
        eventType: 'membership.activated',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleTeamMembershipActivated(
    membership: MembershipPayload,
    email: string,
    userId: string | undefined,
    planName: string,
    interval: any,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    const metadata = membership.metadata || {}
    const teamName =
      typeof metadata.team_name === 'string' && metadata.team_name.trim().length > 0
        ? metadata.team_name
        : 'My Team'
    const teamId = typeof metadata.team_id === 'string' ? metadata.team_id : undefined

    return await prisma.$transaction(async (tx) => {
      // 1. Ensure user exists
      let user = userId ? await tx.user.findUnique({ where: { id: userId } }) : null
      if (!user) {
        user = await tx.user.findUnique({ where: { email } })
      }

      if (!user) {
        // Create user if not exists (Whop user purchasing for the first time)
        user = await tx.user.create({
          data: {
            email,
            auth_user_id: userId || `whop_${membership.user.id}`,
          }
        })
      }

      // 2. Find or create team
      let team = teamId ? await tx.team.findUnique({ where: { id: teamId } }) : null
      if (!team) {
        team = await tx.team.findFirst({
          where: { userId: user.id, name: teamName }
        })
      }

      if (!team) {
        team = await tx.team.create({
          data: {
            name: teamName,
            userId: user.id,
            traderIds: [user.id],
            managers: {
              create: {
                managerId: user.id,
                access: 'admin'
              }
            }
          }
        })
      }

      // 3. Create/Update TeamSubscription
      const endDate = interval === 'lifetime' ?
        new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) :
        (interval === 'year' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

      await tx.teamSubscription.upsert({
        where: { teamId: team.id },
        update: {
          status: 'ACTIVE',
          plan: planName.toUpperCase(),
          interval,
          endDate,
          email,
          userId: user.id
        },
        create: {
          teamId: team.id,
          userId: user.id,
          email,
          plan: planName.toUpperCase(),
          status: 'ACTIVE',
          interval,
          endDate
        }
      })

      logger.info({
        email,
        teamId: team.id,
        teamName: team.name,
        plan: planName
      }, '[WebhookService] Team Membership activated')

      return {
        success: true,
        eventType: 'membership.activated',
        processed: true
      }
    })
  }

  private async handleBusinessMembershipActivated(
    membership: MembershipPayload,
    email: string,
    userId: string | undefined,
    planName: string,
    interval: any,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    const metadata = membership.metadata || {}
    const businessName =
      typeof metadata.business_name === 'string' && metadata.business_name.trim().length > 0
        ? metadata.business_name
        : 'My Business'

    return await prisma.$transaction(async (tx) => {
      // 1. Ensure user exists
      let user = userId ? await tx.user.findUnique({ where: { id: userId } }) : null
      if (!user) {
        user = await tx.user.findUnique({ where: { email } })
      }

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            auth_user_id: userId || `whop_${membership.user.id}`,
          }
        })
      }

      // 2. Find or create business
      let business = await tx.business.findFirst({
        where: { userId: user.id, name: businessName }
      })

      if (!business) {
        business = await tx.business.create({
          data: {
            name: businessName,
            userId: user.id,
            traderIds: [user.id],
            managers: {
              create: {
                managerId: user.id,
                access: 'admin'
              }
            }
          }
        })
      }

      // 3. Create/Update BusinessSubscription
      const endDate = interval === 'lifetime' ?
        new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) :
        (interval === 'year' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

      await tx.businessSubscription.upsert({
        where: { businessId: business.id },
        update: {
          status: 'ACTIVE',
          plan: planName.toUpperCase(),
          interval,
          endDate,
          email,
          userId: user.id
        },
        create: {
          businessId: business.id,
          userId: user.id,
          email,
          plan: planName.toUpperCase(),
          status: 'ACTIVE',
          interval,
          endDate
        }
      })

      logger.info('[WebhookService] Business Membership activated', {
        email,
        businessId: business.id,
        businessName: business.name,
        plan: planName
      })

      return {
        success: true,
        eventType: 'membership.activated',
        processed: true
      }
    })
  }

  private async handleMembershipDeactivated(
    membership: MembershipPayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      if (!membership.user?.email) {
        return {
          success: false,
          eventType: 'membership.deactivated',
          processed: false,
          error: 'No user email in membership data',
        }
      }

      const email = membership.user.email.toLowerCase().trim();
      const metadata = membership.metadata || {}
      const type = metadata.type || 'individual'
      const userId = typeof metadata.user_id === 'string' ? metadata.user_id : undefined

      if (type === 'team') {
        return await this.handleTeamMembershipDeactivated(membership, email, prisma)
      } else if (type === 'business') {
        return await this.handleBusinessMembershipDeactivated(membership, email, prisma)
      }

      // Prefer userId lookup over email to avoid issues with email changes
      const subscription = userId
        ? await prisma.subscription.findUnique({ where: { userId } })
        : await prisma.subscription.findUnique({ where: { email } })

      if (!subscription) {
        logger.warn('[WebhookService] Subscription not found for deactivation', {
          email,
        })
        return {
          success: true,
          eventType: 'membership.deactivated',
          processed: false,
        }
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          endDate: new Date(),
        },
      })

      logger.info('[WebhookService] Membership deactivated', { email: subscription.email })

      return {
        success: true,
        eventType: 'membership.deactivated',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle membership.deactivated', { error })
      return {
        success: false,
        eventType: 'membership.deactivated',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleTeamMembershipDeactivated(
    membership: MembershipPayload,
    email: string,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    const subscription = await prisma.teamSubscription.findUnique({
      where: { email }
    })

    if (!subscription) {
      logger.warn('[WebhookService] Team Subscription not found for deactivation', { email })
      return { success: true, eventType: 'membership.deactivated', processed: false }
    }

    await prisma.teamSubscription.update({
      where: { email },
      data: {
        status: 'CANCELLED',
        endDate: new Date()
      }
    })

    logger.info('[WebhookService] Team Membership deactivated', { email })

    return { success: true, eventType: 'membership.deactivated', processed: true }
  }

  private async handleBusinessMembershipDeactivated(
    membership: MembershipPayload,
    email: string,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    const subscription = await prisma.businessSubscription.findUnique({
      where: { email }
    })

    if (!subscription) {
      logger.warn('[WebhookService] Business Subscription not found for deactivation', { email })
      return { success: true, eventType: 'membership.deactivated', processed: false }
    }

    await prisma.businessSubscription.update({
      where: { email },
      data: {
        status: 'CANCELLED',
        endDate: new Date()
      }
    })

    logger.info('[WebhookService] Business Membership deactivated', { email })

    return { success: true, eventType: 'membership.deactivated', processed: true }
  }

  private async handleMembershipUpdated(
    membership: MembershipPayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      if (!membership.user?.email) {
        return {
          success: false,
          eventType: 'membership.updated',
          processed: false,
          error: 'No user email in membership data',
        }
      }

      const email = membership.user.email.toLowerCase().trim();
      const metadata = membership.metadata || {}
      const type = typeof metadata.type === 'string' ? metadata.type : 'individual'
      const userId = typeof metadata.user_id === 'string' ? metadata.user_id : undefined
      const planName =
        typeof metadata.plan === 'string'
          ? metadata.plan
          : (membership.product?.title || 'PLUS')

      const interval = planName.toLowerCase().includes('monthly') ? 'month' :
        planName.toLowerCase().includes('quarterly') ? 'quarter' :
          planName.toLowerCase().includes('yearly') ? 'year' :
            planName.toLowerCase().includes('lifetime') ? 'lifetime' : 'month'

      const status = membership.status?.toUpperCase()
      const endDate = parseWhopDate(membership.renewal_period_end)

      if (type === 'team') {
        await prisma.teamSubscription.updateMany({
          where: userId ? { userId } : { email },
          data: {
            plan: planName.toUpperCase(),
            interval,
            status,
            endDate
          }
        })
      } else if (type === 'business') {
        await prisma.businessSubscription.updateMany({
          where: userId ? { userId } : { email },
          data: {
            plan: planName.toUpperCase(),
            interval,
            status,
            endDate
          }
        })
      } else {
        // Prefer userId lookup over email
        const lookupWhere = userId ? { userId } : { email }
        await prisma.subscription.update({
          where: lookupWhere,
          data: {
            plan: planName.toUpperCase(),
            interval,
            status,
            endDate,
          },
        })
      }

      logger.info('[WebhookService] Membership updated', {
        email,
        type,
        plan: planName,
      })

      return {
        success: true,
        eventType: 'membership.updated',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle membership.updated', { error })
      return {
        success: false,
        eventType: 'membership.updated',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleMembershipTrialing(
    membership: MembershipPayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      if (!membership.user?.email) {
        return {
          success: false,
          eventType: 'membership.trialing',
          processed: false,
          error: 'No user email in membership data',
        }
      }

      const email = membership.user.email.toLowerCase().trim();
      const metadata = membership.metadata || {}
      const type = metadata.type || 'individual'
      const userId = typeof metadata.user_id === 'string' ? metadata.user_id : undefined

      const trialEndsAt = parseWhopDate(membership.trial_period_end)

      if (type === 'team') {
        await prisma.teamSubscription.updateMany({
          where: userId ? { userId } : { email },
          data: {
            status: 'PENDING',
            trialEndsAt
          }
        })
      } else if (type === 'business') {
        await prisma.businessSubscription.updateMany({
          where: userId ? { userId } : { email },
          data: {
            status: 'PENDING',
            trialEndsAt
          }
        })
      } else {
        const lookupWhere = userId ? { userId } : { email }
        await prisma.subscription.update({
          where: lookupWhere,
          data: {
            status: 'PENDING',
            trialEndsAt,
          },
        })
      }

      logger.info('[WebhookService] Membership trialing', { email, type })

      return {
        success: true,
        eventType: 'membership.trialing',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle membership.trialing', { error })
      return {
        success: false,
        eventType: 'membership.trialing',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handlePaymentSucceeded(
    payment: PaymentPayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      const membershipId = payment.membership_id

      if (!membershipId) {
        return {
          success: false,
          eventType: 'payment.succeeded',
          processed: false,
          error: 'No membership ID in payment data',
        }
      }

      const membership = await whop.memberships.retrieve(membershipId)

      const user = membership.user as WhopMembershipUser | null

      if (!membership || !user?.email) {
        return {
          success: false,
          eventType: 'payment.succeeded',
          processed: false,
          error: 'Could not fetch membership details',
        }
      }

      const metadata = (membership.metadata as Record<string, string>) || {}
      const userId = metadata.user_id || user.id
      const amount = payment.amount || 0
      const email = user.email

      if (!email) {
        return {
          success: false,
          eventType: 'payment.succeeded',
          processed: false,
          error: 'Could not find user email in membership',
        }
      }

      await subscriptionManager.handlePaymentSuccess({
        userId,
        email,
        whopMembershipId: membershipId,
        amount,
        renewalDate: parseWhopDate(membership.renewal_period_end),
      })

      // Reset retry state once a payment recovers successfully.
      this.retryAttempts.delete(membershipId)

      logger.info('[WebhookService] Payment succeeded', {
        email,
        amount,
      })

      return {
        success: true,
        eventType: 'payment.succeeded',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle payment.succeeded', { error })
      return {
        success: false,
        eventType: 'payment.succeeded',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handlePaymentFailed(
    payment: PaymentPayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      const membershipId = payment.membership_id

      if (!membershipId) {
        return {
          success: false,
          eventType: 'payment.failed',
          processed: false,
          error: 'No membership ID in payment data',
        }
      }

      const membership = await whop.memberships.retrieve(membershipId)

      const user = membership.user as WhopMembershipUser | null

      if (!membership || !user?.email) {
        return {
          success: false,
          eventType: 'payment.failed',
          processed: false,
          error: 'Could not fetch membership details',
        }
      }

      const metadata = (membership.metadata as Record<string, string>) || {}
      const userId = metadata.user_id || user.id
      const email = user.email

      if (this.retryAttempts.size >= this.maxRetryAttemptEntries && !this.retryAttempts.has(membershipId)) {
        const oldestKey = this.retryAttempts.keys().next().value as string | undefined
        if (oldestKey) {
          this.retryAttempts.delete(oldestKey)
        }
      }

      const attemptNumber = this.retryAttempts.get(membershipId) || 1
      this.retryAttempts.set(membershipId, attemptNumber + 1)

      await subscriptionManager.handlePaymentFailure({
        userId,
        email: email || 'unknown@whop.com',
        whopMembershipId: membershipId,
        attemptNumber,
      })

      logger.info('[WebhookService] Payment failed', {
        email,
        attemptNumber,
      })

      return {
        success: true,
        eventType: 'payment.failed',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle payment.failed', { error })
      return {
        success: false,
        eventType: 'payment.failed',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handlePaymentRefunded(
    refund: RefundPayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      const paymentId = refund.payment_id
      const amount = refund.amount

      await paymentService.processRefund({
        transactionId: paymentId,
        amount,
        reason: 'Processed via Whop webhook',
      })

      logger.info('[WebhookService] Payment refunded', {
        paymentId,
        amount,
      })

      return {
        success: true,
        eventType: 'payment.refunded',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle payment.refunded', { error })
      return {
        success: false,
        eventType: 'payment.refunded',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handlePaymentPartiallyRefunded(
    refund: RefundPayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    return await this.handlePaymentRefunded(refund, prisma)
  }

  private async handleInvoiceCreated(
    invoice: InvoicePayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      if (!invoice.user?.email || !invoice.membership?.id) {
        return {
          success: false,
          eventType: 'invoice.created',
          processed: false,
          error: 'Missing invoice data',
        }
      }

      const metadataUserId = invoice.membership.metadata?.user_id
      const userId = typeof metadataUserId === 'string' ? metadataUserId : invoice.user?.id
      if (!userId) {
        return {
          success: false,
          eventType: 'invoice.created',
          processed: false,
          error: 'Missing user identifier',
        }
      }

      await paymentService.createInvoice({
        userId,
        email: invoice.user.email,
        whopInvoiceId: invoice.id,
        whopMembershipId: invoice.membership.id,
        amountDue: invoice.amount_due || 0,
        currency: invoice.currency || 'USD',
        dueDate: parseWhopDate(invoice.due_date),
        hostedInvoiceUrl: invoice.hosted_invoice_url,
      })

      logger.info('[WebhookService] Invoice created', {
        invoiceId: invoice.id,
        email: invoice.user.email,
      })

      return {
        success: true,
        eventType: 'invoice.created',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle invoice.created', { error })
      return {
        success: false,
        eventType: 'invoice.created',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleInvoicePaid(
    invoice: InvoicePayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      await prisma.invoice.update({
        where: { whopInvoiceId: invoice.id },
        data: {
          status: 'PAID',
          amountPaid: invoice.amount_paid || 0,
          paidAt: parseWhopDate(invoice.paid_at) || new Date(),
        },
      })

      logger.info('[WebhookService] Invoice paid', {
        invoiceId: invoice.id,
      })

      return {
        success: true,
        eventType: 'invoice.paid',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle invoice.paid', { error })
      return {
        success: false,
        eventType: 'invoice.paid',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleInvoicePaymentFailed(
    invoice: InvoicePayload,
    _prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      await prisma.invoice.update({
        where: { whopInvoiceId: invoice.id },
        data: {
          status: 'OPEN',
        },
      })

      logger.info('[WebhookService] Invoice payment failed', {
        invoiceId: invoice.id,
      })

      return {
        success: true,
        eventType: 'invoice.payment_failed',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle invoice.payment_failed', { error })
      return {
        success: false,
        eventType: 'invoice.payment_failed',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async logWebhookEvent(data: {
    eventId: string
    eventType: string
    success: boolean
    processed: boolean
    error?: string
    retries?: number
  }): Promise<void> {
    try {
      logger.info('[WebhookService] Webhook event logged', data)
    } catch (error) {
      logger.error('[WebhookService] Failed to log webhook event', { error, data })
    }
  }

  async getWebhookStats(options?: {
    startDate?: Date
    endDate?: Date
    eventType?: string
  }): Promise<{
    success: boolean
    stats?: {
      totalEvents: number
      successfulEvents: number
      failedEvents: number
      duplicateEvents: number
      retryCount: number
      eventsByType: Record<string, number>
    }
    error?: string
  }> {
    try {
      return {
        success: true,
        stats: {
          totalEvents: this.stats.totalEvents,
          successfulEvents: this.stats.successfulEvents,
          failedEvents: this.stats.failedEvents,
          duplicateEvents: this.stats.duplicateEvents,
          retryCount: this.stats.retryCount,
          eventsByType: Object.fromEntries(this.stats.eventsByType),
        },
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to fetch webhook stats', { error })
      return {
        success: false,
        error: 'Failed to fetch webhook stats',
      }
    }
  }
}

export const webhookService = WebhookService.getInstance()

export async function POST(req: NextRequest) {
  const requestBodyText = await req.text()
  const headers = Object.fromEntries(req.headers)

  let event
  try {
    event = whop.webhooks.unwrap(requestBodyText, { headers })
  } catch (err) {
    logger.error('[Webhook] Signature verification failed', { err })
    return NextResponse.json(
      { message: `Webhook Error: ${err}` },
      { status: 400 }
    )
  }

  const result = await webhookService.processWebhook(event)

  if (result.success || result.alreadyProcessed) {
    return NextResponse.json({ message: 'Received' }, { status: 200 })
  } else {
    return NextResponse.json(
      { message: result.error || 'Processing failed' },
      { status: 500 }
    )
  }
}
