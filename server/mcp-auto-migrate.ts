import { prisma } from '@/lib/prisma'

let ensurePromise: Promise<void> | null = null

const API_KEY_SQL = `
CREATE TABLE IF NOT EXISTS "ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ApiKey" ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "ApiKey_key_key" ON "ApiKey"("key");
CREATE INDEX IF NOT EXISTS "ApiKey_userId_idx" ON "ApiKey"("userId");
CREATE INDEX IF NOT EXISTS "ApiKey_userId_revokedAt_idx" ON "ApiKey"("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "ApiKey_keyPrefix_idx" ON "ApiKey"("keyPrefix");
`

const AUDIT_LOG_SQL = `
CREATE TABLE IF NOT EXISTS "McpAuditLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "apiKeyId" TEXT,
    "userId" TEXT,
    "tool" TEXT NOT NULL,
    "argsKeys" TEXT,
    "success" BOOLEAN NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "McpAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "McpAuditLog_apiKeyId_createdAt_idx" ON "McpAuditLog"("apiKeyId", "createdAt");
CREATE INDEX IF NOT EXISTS "McpAuditLog_userId_createdAt_idx" ON "McpAuditLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "McpAuditLog_tool_createdAt_idx" ON "McpAuditLog"("tool", "createdAt");
CREATE INDEX IF NOT EXISTS "McpAuditLog_createdAt_idx" ON "McpAuditLog"("createdAt");
`

async function ensureMcpTablesOnce(): Promise<void> {
  await prisma.$executeRawUnsafe(API_KEY_SQL)
  await prisma.$executeRawUnsafe(AUDIT_LOG_SQL)
}

export function ensureMcpTables(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = ensureMcpTablesOnce().catch((err) => {
      console.error('[mcp-auto-migrate] Failed to auto-create tables:', err)
      ensurePromise = null
    })
  }
  return ensurePromise
}

export function isMissingTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return msg.includes('does not exist') ||
    (msg.includes('relation') && msg.includes('does not exist')) ||
    (msg.includes('table') && msg.includes('does not exist'))
}
