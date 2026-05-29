import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'
import { requireAdminAccess } from './mcp-auth'
import { requireAdmin } from './security'
import { toolError, toolSuccess, requireParam, type McpToolResult, type ToolDefinition } from './mcp-helpers'
import type { EmailTemplate } from '@/app/[locale]/admin/actions/send-email'
import { sendEmailsToUsersInternal } from '@/app/[locale]/admin/actions/send-email'

const WRITE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
const DESTROY = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }

export const adminWriteTools: ToolDefinition[] = [
  // ── Blog CRUD ──
  {
    name: 'admin_create_blog_post',
    description: `Create a new blog post (admin only).

Args:
  - title (string, required): Post title
  - slug (string, required): URL slug (must be unique)
  - excerpt (string, required): Short excerpt
  - content (string, required): Full post content
  - category (string, optional): TRADING_TIPS, MARKET_ANALYSIS, PSYCHOLOGY, RISK_MANAGEMENT, PLATFORM_UPDATES
  - coverImage (string, optional): Cover image URL
  - published (boolean, optional): Publish immediately (default false)

Returns: Created blog post`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        excerpt: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string', enum: ['TRADING_TIPS', 'MARKET_ANALYSIS', 'PSYCHOLOGY', 'RISK_MANAGEMENT', 'PLATFORM_UPDATES'] },
        coverImage: { type: 'string' },
        published: { type: 'boolean' },
      },
      required: ['title', 'slug', 'excerpt', 'content'],
    },
    annotations: WRITE,
  },
  {
    name: 'admin_update_blog_post',
    description: `Update an existing blog post (admin only).

Args:
  - postId (string, required): Blog post ID
  - title (string, optional): New title
  - excerpt (string, optional): New excerpt
  - content (string, optional): New content
  - category (string, optional): New category
  - coverImage (string, optional): New cover image URL
  - published (boolean, optional): Publish/unpublish

Returns: Updated blog post`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        postId: { type: 'string' },
        title: { type: 'string' },
        excerpt: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string', enum: ['TRADING_TIPS', 'MARKET_ANALYSIS', 'PSYCHOLOGY', 'RISK_MANAGEMENT', 'PLATFORM_UPDATES'] },
        coverImage: { type: 'string' },
        published: { type: 'boolean' },
      },
      required: ['postId'],
    },
    annotations: WRITE,
  },
  {
    name: 'admin_delete_blog_post',
    description: `Delete a blog post (admin only).

Args:
  - postId (string, required): Blog post ID

Returns: Confirmation`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: { postId: { type: 'string' } },
      required: ['postId'],
    },
    annotations: DESTROY,
  },

  // ── Prop Firm CRUD ──
  {
    name: 'admin_create_prop_firm',
    description: `Create a new prop firm listing (admin only).

Args:
  - name (string, required): Firm name
  - slug (string, required): URL slug (must be unique)
  - category (string, optional): Firm category
  - description (string, optional): Full description
  - shortDesc (string, optional): Short description (max 255 chars)
  - platform (string, optional): Trading platform
  - payoutModel (string, optional): Payout model
  - drawdownType (string, optional): Drawdown type
  - profitSplit (string, optional): Profit split (e.g. "80/20")
  - maxAllocation (string, optional): Max allocation
  - referralUrl (string, optional): Referral/affiliate URL
  - logoUrl (string, optional): Logo URL
  - isActive (boolean, optional): Active status (default true)

Returns: Created prop firm`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        category: { type: 'string' },
        description: { type: 'string' },
        shortDesc: { type: 'string' },
        platform: { type: 'string' },
        payoutModel: { type: 'string' },
        drawdownType: { type: 'string' },
        profitSplit: { type: 'string' },
        maxAllocation: { type: 'string' },
        referralUrl: { type: 'string' },
        logoUrl: { type: 'string' },
        isActive: { type: 'boolean' },
      },
      required: ['name', 'slug'],
    },
    annotations: WRITE,
  },
  {
    name: 'admin_update_prop_firm',
    description: `Update an existing prop firm listing (admin only).

Args:
  - firmId (string, required): Prop firm ID
  - name (string, optional): Updated name
  - category (string, optional): Updated category
  - description (string, optional): Updated description
  - shortDesc (string, optional): Updated short description
  - platform (string, optional): Updated platform
  - payoutModel (string, optional): Updated payout model
  - drawdownType (string, optional): Updated drawdown type
  - profitSplit (string, optional): Updated profit split
  - maxAllocation (string, optional): Updated max allocation
  - referralUrl (string, optional): Updated referral URL
  - logoUrl (string, optional): Updated logo URL
  - isActive (boolean, optional): Updated active status

Returns: Updated prop firm`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        firmId: { type: 'string' },
        name: { type: 'string' },
        category: { type: 'string' },
        description: { type: 'string' },
        shortDesc: { type: 'string' },
        platform: { type: 'string' },
        payoutModel: { type: 'string' },
        drawdownType: { type: 'string' },
        profitSplit: { type: 'string' },
        maxAllocation: { type: 'string' },
        referralUrl: { type: 'string' },
        logoUrl: { type: 'string' },
        isActive: { type: 'boolean' },
      },
      required: ['firmId'],
    },
    annotations: WRITE,
  },
  {
    name: 'admin_delete_prop_firm',
    description: `Soft-delete a prop firm by setting isActive to false (admin only).

Args:
  - firmId (string, required): Prop firm ID

Returns: Confirmation`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: { firmId: { type: 'string' } },
      required: ['firmId'],
    },
    annotations: DESTROY,
  },

  // ── Coupon Management ──
  {
    name: 'admin_create_coupon',
    description: `Create a coupon/deal for a prop firm (admin only).

Args:
  - propFirmId (string, required): Prop firm ID
  - code (string, required): Coupon code
  - description (string, optional): Deal description
  - discountPercent (number, optional): Discount percentage
  - challengeFee (number, optional): Challenge fee amount
  - drawdownType (string, optional): Drawdown type for this deal
  - payoutModel (string, optional): Payout model
  - platform (string, optional): Platform
  - claimUrl (string, optional): Direct claim URL
  - isActive (boolean, optional): Active (default true)
  - startsAt (string, optional): Start date (ISO 8601)
  - expiresAt (string, optional): Expiry date (ISO 8601)

Returns: Created coupon`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        propFirmId: { type: 'string' },
        code: { type: 'string' },
        description: { type: 'string' },
        discountPercent: { type: 'number' },
        challengeFee: { type: 'number' },
        drawdownType: { type: 'string' },
        payoutModel: { type: 'string' },
        platform: { type: 'string' },
        claimUrl: { type: 'string' },
        isActive: { type: 'boolean' },
        startsAt: { type: 'string' },
        expiresAt: { type: 'string' },
      },
      required: ['propFirmId', 'code'],
    },
    annotations: WRITE,
  },
  {
    name: 'admin_delete_coupon',
    description: `Delete a coupon/deal (admin only).

Args:
  - couponId (string, required): Coupon ID

Returns: Confirmation`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: { couponId: { type: 'string' } },
      required: ['couponId'],
    },
    annotations: DESTROY,
  },

  // ── Review Moderation ──
  {
    name: 'admin_moderate_review',
    description: `Moderate a prop firm review — approve, reject, or flag it (admin only).

Args:
  - reviewId (string, required): Review ID
  - action (string, required): "approve", "reject", or "flag"

Returns: Updated review`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        reviewId: { type: 'string' },
        action: { type: 'string', enum: ['approve', 'reject', 'flag'], description: 'Moderation action' },
      },
      required: ['reviewId', 'action'],
    },
    annotations: WRITE,
  },
  {
    name: 'admin_get_review_moderation_queue',
    description: `Get reviews pending moderation — flagged or pending status (admin only).

Args:
  - limit (number, optional): Max reviews (default 50, max 100)
  - offset (number, optional): Pagination offset

Returns: Array of reviews needing moderation`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        limit: { type: 'number' },
        offset: { type: 'number' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },

  // ── User Management ──
  {
    name: 'admin_update_user',
    description: `Update a user's admin-controlled settings (admin only).

Args:
  - userId (string, required): User ID
  - isBeta (boolean, optional): Beta access flag
  - showOnLeaderboard (boolean, optional): Leaderboard visibility

Returns: Updated user fields`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        userId: { type: 'string' },
        isBeta: { type: 'boolean' },
        showOnLeaderboard: { type: 'boolean' },
      },
      required: ['userId'],
    },
    annotations: WRITE,
  },

  // ── Admin Email / Newsletter (Top 15 #15) - wrap admin email actions + welcome/weekly with strict requireAdmin
  {
    name: 'admin_send_email',
    description: `Send templated email to list of users (admin only). Uses Resend batch. Templates include welcome, weekly-recap, etc.
Requires admin ctx. Full audit via McpAuditLog.

Args:
  - template (string, required): welcome | weekly-recap | black-friday | new-feature | ...
  - userIds (string[], required): Target internal user IDs
  - customProps (object, optional): Props for template
  - subject (string, optional): Override subject

Returns: { success, successCount, errorCount, totalUsers }`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        template: { type: 'string', description: 'Email template key (welcome, weekly-recap, ...)' },
        userIds: { type: 'array', items: { type: 'string' }, description: 'List of user IDs to email' },
        customProps: { type: 'object', description: 'Template-specific props' },
        subject: { type: 'string', description: 'Optional subject override' },
      },
      required: ['template', 'userIds'],
    },
    annotations: WRITE,
  },
  {
    name: 'admin_send_welcome_email',
    description: `Convenience: Send welcome email to users (admin only). Template="welcome".
Args: userIds (required), customProps (optional)
Returns: send result`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        userIds: { type: 'array', items: { type: 'string' } },
        customProps: { type: 'object' },
      },
      required: ['userIds'],
    },
    annotations: WRITE,
  },
  {
    name: 'admin_send_weekly_recap',
    description: `Convenience: Send weekly trading recap emails (admin only). Template="weekly-recap".
Args: userIds (required), customProps (optional, e.g. stats)
Returns: send result`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        userIds: { type: 'array', items: { type: 'string' } },
        customProps: { type: 'object' },
      },
      required: ['userIds'],
    },
    annotations: WRITE,
  },
]

export async function handleAdminWriteToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext): Promise<McpToolResult> {
  requireAdminAccess(ctx)

  switch (toolName) {
    case 'admin_create_blog_post': return await adminCreateBlogPost(ctx, args)
    case 'admin_update_blog_post': return await adminUpdateBlogPost(args)
    case 'admin_delete_blog_post': return await adminDeleteBlogPost(args)
    case 'admin_create_prop_firm': return await adminCreatePropFirm(args)
    case 'admin_update_prop_firm': return await adminUpdatePropFirm(args)
    case 'admin_delete_prop_firm': return await adminDeletePropFirm(args)
    case 'admin_create_coupon': return await adminCreateCoupon(args)
    case 'admin_delete_coupon': return await adminDeleteCoupon(args)
    case 'admin_moderate_review': return await adminModerateReview(args)
    case 'admin_get_review_moderation_queue': return await adminGetReviewModerationQueue(args)
    case 'admin_update_user': return await adminUpdateUser(args)
    // Admin email (Top 15 #15) - requireAdmin + wrap internal send action
    case 'admin_send_email': return await adminSendEmail(ctx, args)
    case 'admin_send_welcome_email': return await adminSendWelcomeEmail(ctx, args)
    case 'admin_send_weekly_recap': return await adminSendWeeklyRecap(ctx, args)
    default: return toolError(`Unknown admin write tool: ${toolName}`)
  }
}

// ── Blog CRUD ──

async function adminCreateBlogPost(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const title = requireParam(args, 'title')
  const slug = requireParam(args, 'slug')
  const excerpt = requireParam(args, 'excerpt')
  const content = requireParam(args, 'content')

  const existing = await prisma.blogPost.findUnique({ where: { slug } })
  if (existing) return toolError(`Blog post with slug "${slug}" already exists`)

  const validCategories = ['TRADING_TIPS', 'MARKET_ANALYSIS', 'PSYCHOLOGY', 'RISK_MANAGEMENT', 'PLATFORM_UPDATES']
  const category = typeof args.category === 'string' && validCategories.includes(args.category)
    ? args.category
    : 'PLATFORM_UPDATES'

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      category: category as 'TRADING_TIPS' | 'MARKET_ANALYSIS' | 'PSYCHOLOGY' | 'RISK_MANAGEMENT' | 'PLATFORM_UPDATES',
      coverImage: typeof args.coverImage === 'string' ? args.coverImage : null,
      published: typeof args.published === 'boolean' ? args.published : false,
      authorId: ctx.userId,
    },
  })

  return toolSuccess(post)
}

async function adminUpdateBlogPost(args: Record<string, unknown>): Promise<McpToolResult> {
  const postId = requireParam(args, 'postId')

  const existing = await prisma.blogPost.findUnique({ where: { id: postId } })
  if (!existing) return toolError('Blog post not found')

  const data: Record<string, unknown> = {}
  if (typeof args.title === 'string') data.title = args.title
  if (typeof args.excerpt === 'string') data.excerpt = args.excerpt
  if (typeof args.content === 'string') data.content = args.content
  if (typeof args.category === 'string') data.category = args.category
  if (typeof args.coverImage === 'string') data.coverImage = args.coverImage
  if (typeof args.published === 'boolean') data.published = args.published

  if (Object.keys(data).length === 0) return toolError('No fields to update')

  const updated = await prisma.blogPost.update({ where: { id: postId }, data: data as Parameters<typeof prisma.blogPost.update>[0]['data'] })
  return toolSuccess(updated)
}

async function adminDeleteBlogPost(args: Record<string, unknown>): Promise<McpToolResult> {
  const postId = requireParam(args, 'postId')

  const existing = await prisma.blogPost.findUnique({ where: { id: postId } })
  if (!existing) return toolError('Blog post not found')

  await prisma.blogPost.delete({ where: { id: postId } })
  return toolSuccess({ deleted: true, postId, title: existing.title })
}

// ── Prop Firm CRUD ──

async function adminCreatePropFirm(args: Record<string, unknown>): Promise<McpToolResult> {
  const name = requireParam(args, 'name')
  const slug = requireParam(args, 'slug')

  const existing = await prisma.propFirm.findUnique({ where: { slug } })
  if (existing) return toolError(`Prop firm with slug "${slug}" already exists`)

  const data: Record<string, unknown> = { name, slug }
  if (typeof args.category === 'string') data.category = args.category
  if (typeof args.description === 'string') data.description = args.description
  if (typeof args.shortDesc === 'string') data.shortDesc = args.shortDesc
  if (typeof args.platform === 'string') data.platform = args.platform
  if (typeof args.payoutModel === 'string') data.payoutModel = args.payoutModel
  if (typeof args.drawdownType === 'string') data.drawdownType = args.drawdownType
  if (typeof args.profitSplit === 'string') data.profitSplit = args.profitSplit
  if (typeof args.maxAllocation === 'string') data.maxAllocation = args.maxAllocation
  if (typeof args.referralUrl === 'string') data.referralUrl = args.referralUrl
  if (typeof args.logoUrl === 'string') data.logoUrl = args.logoUrl
  if (typeof args.isActive === 'boolean') data.isActive = args.isActive

  const firm = await prisma.propFirm.create({ data: data as Parameters<typeof prisma.propFirm.create>[0]['data'] })
  return toolSuccess(firm)
}

async function adminUpdatePropFirm(args: Record<string, unknown>): Promise<McpToolResult> {
  const firmId = requireParam(args, 'firmId')

  const existing = await prisma.propFirm.findUnique({ where: { id: firmId } })
  if (!existing) return toolError('Prop firm not found')

  const data: Record<string, unknown> = {}
  if (typeof args.name === 'string') data.name = args.name
  if (typeof args.category === 'string') data.category = args.category
  if (typeof args.description === 'string') data.description = args.description
  if (typeof args.shortDesc === 'string') data.shortDesc = args.shortDesc
  if (typeof args.platform === 'string') data.platform = args.platform
  if (typeof args.payoutModel === 'string') data.payoutModel = args.payoutModel
  if (typeof args.drawdownType === 'string') data.drawdownType = args.drawdownType
  if (typeof args.profitSplit === 'string') data.profitSplit = args.profitSplit
  if (typeof args.maxAllocation === 'string') data.maxAllocation = args.maxAllocation
  if (typeof args.referralUrl === 'string') data.referralUrl = args.referralUrl
  if (typeof args.logoUrl === 'string') data.logoUrl = args.logoUrl
  if (typeof args.isActive === 'boolean') data.isActive = args.isActive

  if (Object.keys(data).length === 0) return toolError('No fields to update')

  const updated = await prisma.propFirm.update({ where: { id: firmId }, data: data as Parameters<typeof prisma.propFirm.update>[0]['data'] })
  return toolSuccess(updated)
}

async function adminDeletePropFirm(args: Record<string, unknown>): Promise<McpToolResult> {
  const firmId = requireParam(args, 'firmId')

  const existing = await prisma.propFirm.findUnique({ where: { id: firmId } })
  if (!existing) return toolError('Prop firm not found')

  // Soft delete
  await prisma.propFirm.update({ where: { id: firmId }, data: { isActive: false } })
  return toolSuccess({ deleted: true, firmId, name: existing.name, method: 'soft_delete' })
}

// ── Coupon Management ──

async function adminCreateCoupon(args: Record<string, unknown>): Promise<McpToolResult> {
  const propFirmId = requireParam(args, 'propFirmId')
  const code = requireParam(args, 'code')

  const firm = await prisma.propFirm.findUnique({ where: { id: propFirmId } })
  if (!firm) return toolError('Prop firm not found')

  const existing = await prisma.propFirmCoupon.findUnique({
    where: { propFirmId_code: { propFirmId, code } },
  })
  if (existing) return toolError(`Coupon "${code}" already exists for this firm`)

  const data: Record<string, unknown> = { propFirmId, code }
  if (typeof args.description === 'string') data.description = args.description
  if (typeof args.discountPercent === 'number') data.discountPercent = args.discountPercent
  if (typeof args.challengeFee === 'number') data.challengeFee = args.challengeFee
  if (typeof args.drawdownType === 'string') data.drawdownType = args.drawdownType
  if (typeof args.payoutModel === 'string') data.payoutModel = args.payoutModel
  if (typeof args.platform === 'string') data.platform = args.platform
  if (typeof args.claimUrl === 'string') data.claimUrl = args.claimUrl
  if (typeof args.isActive === 'boolean') data.isActive = args.isActive
  if (typeof args.startsAt === 'string') {
    const d = new Date(args.startsAt)
    if (!Number.isNaN(d.getTime())) data.startsAt = d
  }
  if (typeof args.expiresAt === 'string') {
    const d = new Date(args.expiresAt)
    if (!Number.isNaN(d.getTime())) data.expiresAt = d
  }

  const coupon = await prisma.propFirmCoupon.create({ data: data as Parameters<typeof prisma.propFirmCoupon.create>[0]['data'] })
  return toolSuccess(coupon)
}

async function adminDeleteCoupon(args: Record<string, unknown>): Promise<McpToolResult> {
  const couponId = requireParam(args, 'couponId')

  const existing = await prisma.propFirmCoupon.findUnique({ where: { id: couponId } })
  if (!existing) return toolError('Coupon not found')

  await prisma.propFirmCoupon.delete({ where: { id: couponId } })
  return toolSuccess({ deleted: true, couponId, code: existing.code })
}

// ── Review Moderation ──

async function adminModerateReview(args: Record<string, unknown>): Promise<McpToolResult> {
  const reviewId = requireParam(args, 'reviewId')
  const action = requireParam(args, 'action')

  const validActions = ['approve', 'reject', 'flag']
  if (!validActions.includes(action)) return toolError(`Invalid action. Use: ${validActions.join(', ')}`)

  const existing = await prisma.propFirmReview.findUnique({ where: { id: reviewId } })
  if (!existing) return toolError('Review not found')

  const statusMap: Record<string, string> = { approve: 'approved', reject: 'rejected', flag: 'flagged' }
  const updateData: Record<string, unknown> = { status: statusMap[action] }
  if (action === 'flag') updateData.flaggedAt = new Date()

  const updated = await prisma.propFirmReview.update({
    where: { id: reviewId },
    data: updateData as Parameters<typeof prisma.propFirmReview.update>[0]['data'],
  })

  return toolSuccess({ id: updated.id, status: updated.status, action })
}

async function adminGetReviewModerationQueue(args: Record<string, unknown>): Promise<McpToolResult> {
  const limit = Math.min(Math.max(Number(args.limit) || 50, 1), 100)
  const offset = Math.max(Number(args.offset) || 0, 0)

  const reviews = await prisma.propFirmReview.findMany({
    where: { status: { in: ['pending', 'flagged'] } },
    include: {
      propFirm: { select: { name: true, slug: true } },
      user: { select: { username: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })

  return toolSuccess(reviews)
}

// ── User Management ──

async function adminUpdateUser(args: Record<string, unknown>): Promise<McpToolResult> {
  const userId = requireParam(args, 'userId')

  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) return toolError('User not found')

  const data: Record<string, unknown> = {}
  if (typeof args.isBeta === 'boolean') data.isBeta = args.isBeta
  if (typeof args.showOnLeaderboard === 'boolean') data.showOnLeaderboard = args.showOnLeaderboard

  if (Object.keys(data).length === 0) return toolError('No fields to update')

  const updated = await prisma.user.update({
    where: { id: userId },
    data: data as Parameters<typeof prisma.user.update>[0]['data'],
    select: { id: true, username: true, isBeta: true, showOnLeaderboard: true },
  })

  return toolSuccess(updated)
}

// ── Admin Email wrappers (Top 15 #15) - TDD, use requireAdmin from security.ts, wrap action internals
async function adminSendEmail(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  requireAdmin(ctx) // strict per task
  const template = requireParam(args, 'template') as EmailTemplate
  const userIds = Array.isArray(args.userIds) ? (args.userIds as string[]) : []
  if (userIds.length === 0) return toolError('userIds array is required and must not be empty')
  const customProps = (typeof args.customProps === 'object' && args.customProps) ? args.customProps as any : {}
  const subject = typeof args.subject === 'string' ? args.subject : undefined

  const result = await sendEmailsToUsersInternal(template, userIds, customProps, subject)
  if (result.error) return toolError(result.error)
  return toolSuccess(result)
}

async function adminSendWelcomeEmail(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  requireAdmin(ctx)
  const userIds = Array.isArray(args.userIds) ? (args.userIds as string[]) : []
  if (userIds.length === 0) return toolError('userIds required for welcome email')
  const customProps = (typeof args.customProps === 'object' && args.customProps) ? args.customProps as any : {}
  const result = await sendEmailsToUsersInternal('welcome', userIds, customProps)
  if (result.error) return toolError(result.error)
  return toolSuccess(result)
}

async function adminSendWeeklyRecap(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  requireAdmin(ctx)
  const userIds = Array.isArray(args.userIds) ? (args.userIds as string[]) : []
  if (userIds.length === 0) return toolError('userIds required for weekly recap')
  const customProps = (typeof args.customProps === 'object' && args.customProps) ? args.customProps as any : {}
  const result = await sendEmailsToUsersInternal('weekly-recap', userIds, customProps)
  if (result.error) return toolError(result.error)
  return toolSuccess(result)
}
