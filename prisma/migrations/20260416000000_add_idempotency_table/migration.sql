-- CreateTable
CREATE TABLE IF NOT EXISTS "IdempotencyRecord" (
    "key" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "request_hash" TEXT DEFAULT '',
    "status" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("key")
);

-- Index for cleanup cron
CREATE INDEX IF NOT EXISTS "IdempotencyRecord_expires_at_idx" ON "IdempotencyRecord"("expires_at");
