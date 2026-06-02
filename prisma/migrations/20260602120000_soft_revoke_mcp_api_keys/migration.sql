-- Keep revoked MCP API keys for audit history while hiding/denying them.

ALTER TABLE "ApiKey"
  ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ApiKey_userId_revokedAt_idx"
  ON "ApiKey"("userId", "revokedAt");
