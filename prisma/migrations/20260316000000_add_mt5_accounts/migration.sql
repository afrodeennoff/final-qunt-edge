-- Create MT5 Accounts Table
-- Stores encrypted MT5 credentials for automatic trade import

CREATE TABLE "public"."MT5Account" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "login" BIGINT NOT NULL,
    "server" TEXT NOT NULL,
    
    -- Encrypted investor password (AES-256-GCM)
    "passwordCiphertext" TEXT NOT NULL,
    "passwordIv" TEXT NOT NULL,
    "passwordTag" TEXT NOT NULL,
    "passwordKeyVersion" TEXT DEFAULT '1',
    
    -- Status tracking
    "status" TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING, ACTIVE, ERROR, PAUSED
    "lastSyncError" TEXT,
    
    -- Sync tracking
    "lastSyncAt" TIMESTAMP,
    "nextSyncAt" TIMESTAMP,
    "lastTradeCount" INTEGER DEFAULT 0,
    
    -- Activity tracking for adaptive sync intervals
    "isActive" BOOLEAN DEFAULT false,
    "lastActivityAt" TIMESTAMP,
    "tradeCount24h" INTEGER DEFAULT 0,
    
    -- Metadata
    "accountName" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one MT5 account per user
    CONSTRAINT "MT5Account_user_login_server_unique" UNIQUE ("userId", "login", "server")
);

-- Indexes for efficient queries
CREATE INDEX "MT5Account_userId_idx" ON "public"."MT5Account" ("userId");
CREATE INDEX "MT5Account_status_idx" ON "public"."MT5Account" ("status");
CREATE INDEX "MT5Account_nextSyncAt_idx" ON "public"."MT5Account" ("nextSyncAt");
CREATE INDEX "MT5Account_userId_status_idx" ON "public"."MT5Account" ("userId", "status");

-- Add foreign key to User
ALTER TABLE "public"."MT5Account" 
    ADD CONSTRAINT "MT5Account_userId_fkey" 
    FOREIGN KEY ("userId") 
    REFERENCES "public"."User" ("id") 
    ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE "public"."MT5Account" ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own MT5 accounts
CREATE POLICY "mt5_accounts_owner_access" ON "public"."MT5Account"
    FOR ALL
    USING (
        "userId" IN (
            SELECT "auth"."uid"() as "userId"
            FROM "public"."User"
            WHERE "auth_user_id" = "auth"."uid"()
        )
    );

-- Alternative simpler policy using direct userId comparison
DROP POLICY "mt5_accounts_owner_access" ON "public"."MT5Account";

CREATE POLICY "mt5_accounts_owner_access" ON "public"."MT5Account"
    FOR ALL
    USING ("userId"::text IN (
        SELECT "id"::text 
        FROM "public"."User" 
        WHERE "auth_user_id" = "auth"."uid"()
    ));

-- Service role full access
CREATE POLICY "mt5_accounts_service_role_all" ON "public"."MT5Account"
    FOR ALL
    USING (false)
    WITH CHECK (false);
