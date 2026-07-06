-- AlterTable
ALTER TABLE "public"."AiRequestLog"
  ADD COLUMN "budgetLimit"     INTEGER,
  ADD COLUMN "budgetUsed"      INTEGER,
  ADD COLUMN "budgetRemaining" INTEGER;
