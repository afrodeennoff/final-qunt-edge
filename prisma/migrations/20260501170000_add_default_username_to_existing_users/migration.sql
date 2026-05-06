-- Set default username for existing users (lowercase email)
UPDATE "User" SET "username" = LOWER("email") WHERE "username" IS NULL;

-- Add check constraint to ensure username is not null after update
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
