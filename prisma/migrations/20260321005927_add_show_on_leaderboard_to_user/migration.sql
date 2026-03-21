-- Add showOnLeaderboard field to User model
ALTER TABLE "public"."User" ADD COLUMN "showOnLeaderboard" boolean NOT NULL DEFAULT true;