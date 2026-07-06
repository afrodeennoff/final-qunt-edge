-- Add hideLatestTrade column to User model for controlling latest trade visibility
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hideLatestTrade" BOOLEAN NOT NULL DEFAULT false;
