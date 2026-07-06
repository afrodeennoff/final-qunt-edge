-- Create McpAuditLog table for MCP tool call auditing
-- This is the official migration. Run via prisma migrate or manually in Supabase.
-- id uses @default(uuid()) in Prisma schema.

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
