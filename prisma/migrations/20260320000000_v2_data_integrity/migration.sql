-- Migration: v2_data_integrity
-- 1) Create PayoutStatus enum (includes CANCELLED used by frontend)
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PAID', 'REFUSED', 'CANCELLED');

-- 2) Alter Payout.status to enum type — drop default first, then type, then re-set default
ALTER TABLE "Payout" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payout" ALTER COLUMN "status" TYPE "PayoutStatus" USING ("status"::text::"PayoutStatus");
ALTER TABLE "Payout" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"PayoutStatus";

-- 3) Add propFirmId column to Account (nullable)
ALTER TABLE "Account" ADD COLUMN "propFirmId" VARCHAR(255);

-- 4) Add FK constraint for propFirmId
ALTER TABLE "Account" ADD CONSTRAINT "Account_propFirmId_fkey" FOREIGN KEY ("propFirmId") REFERENCES "PropFirm"("id") ON DELETE SET NULL;

-- 5) Add index on propFirmId
CREATE INDEX "Account_propFirmId_idx" ON "Account" ("propFirmId");

-- 6) Create the Challenge table
CREATE TABLE "challenge" (
  "id" VARCHAR(255) PRIMARY KEY,
  "propFirmId" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "phase" INTEGER NOT NULL DEFAULT 1,
  "accountSize" DECIMAL(18,2) NOT NULL,

  "targetProfit" DECIMAL(18,2) NOT NULL,
  "maxDailyLoss" DECIMAL(18,2) NOT NULL,
  "maxTotalLoss" DECIMAL(18,2) NOT NULL,
  "minTradingDays" INTEGER,
  "maxTradingDays" INTEGER,

  "profitSplit" INTEGER NOT NULL DEFAULT 80,
  "payoutPolicy" VARCHAR(255),

  "price" DECIMAL(18,2) NOT NULL,
  "priceWithPromo" DECIMAL(18,2),

  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,

  CONSTRAINT "Challenge_propFirmId_fkey" FOREIGN KEY ("propFirmId") REFERENCES "prop_firm"("id") ON DELETE CASCADE
);

-- 7) Add indexes on Challenge
CREATE INDEX "Challenge_propFirmId_idx" ON "challenge" ("propFirmId");
CREATE INDEX "Challenge_propFirmId_accountSize_idx" ON "challenge" ("propFirmId", "accountSize");
