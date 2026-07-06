export interface ToolAnnotations {
  readOnlyHint?: boolean
  destructiveHint?: boolean
  idempotentHint?: boolean
  openWorldHint?: boolean
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  outputSchema?: Record<string, unknown>
  annotations?: ToolAnnotations
}

export type McpToolResult = { content: Array<{ type: 'text'; text: string }>; isError?: boolean }

export function toolError(message: string): McpToolResult {
  return { content: [{ type: 'text', text: message }], isError: true }
}

export function toolSuccess(data: unknown): McpToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
}

export function parseOptionalDate(value: unknown): Date | undefined {
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

export function buildDateFilter(args: Record<string, unknown>): Record<string, unknown> | undefined {
  const startDate = parseOptionalDate(args.startDate)
  const endDate = parseOptionalDate(args.endDate)
  if (!startDate && !endDate) return undefined
  const filter: Record<string, unknown> = {}
  if (startDate) filter.gte = startDate
  if (endDate) filter.lte = endDate
  return filter
}

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(Math.floor(n), min), max)
}

export function requireParam(args: Record<string, unknown>, name: string): string {
  const value = args[name]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required parameter: ${name}`)
  }
  return value
}
