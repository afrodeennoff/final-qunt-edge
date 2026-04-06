import { z } from 'zod'

const whopUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
})

const whopProductSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
}).passthrough().optional()

const whopMetadataSchema = z.object({}).catchall(z.unknown()).optional()

const baseMembershipSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  created_at: z.union([z.string(), z.number()]).optional(),
  renewal_period_end: z.union([z.string(), z.number()]).nullable().optional(),
  trial_period_end: z.union([z.string(), z.number()]).nullable().optional(),
  user: whopUserSchema,
  product: whopProductSchema,
  metadata: whopMetadataSchema,
}).passthrough()

export const membershipActivatedSchema = baseMembershipSchema
export const membershipDeactivatedSchema = baseMembershipSchema
export const membershipUpdatedSchema = baseMembershipSchema
export const membershipTrialingSchema = baseMembershipSchema

const basePaymentSchema = z.object({
  id: z.string().optional(),
  membership_id: z.string(),
  amount: z.number().optional(),
}).passthrough()

export const paymentSucceededSchema = basePaymentSchema
export const paymentFailedSchema = basePaymentSchema

export const paymentRefundedSchema = z.object({
  payment_id: z.string(),
  amount: z.number().optional(),
}).passthrough()

export const invoiceSchema = z.object({
  id: z.string(),
  user: whopUserSchema,
  membership: z.object({
    id: z.string(),
    metadata: whopMetadataSchema,
  }).passthrough().optional(),
  amount_due: z.number().optional(),
  amount_paid: z.number().optional(),
  currency: z.string().optional(),
  due_date: z.union([z.string(), z.number()]).nullable().optional(),
  paid_at: z.union([z.string(), z.number()]).nullable().optional(),
  hosted_invoice_url: z.string().optional(),
}).passthrough()

export type MembershipPayload = z.infer<typeof baseMembershipSchema>
export type PaymentPayload = z.infer<typeof basePaymentSchema>
export type RefundPayload = z.infer<typeof paymentRefundedSchema>
export type InvoicePayload = z.infer<typeof invoiceSchema>

export function validateMembership(data: unknown): MembershipPayload {
  return baseMembershipSchema.parse(data)
}

export function validatePayment(data: unknown): PaymentPayload {
  return basePaymentSchema.parse(data)
}

export function validateRefund(data: unknown): RefundPayload {
  return paymentRefundedSchema.parse(data)
}

export function validateInvoice(data: unknown): InvoicePayload {
  return invoiceSchema.parse(data)
}
