-- AddUsernameToUser
-- Add username and username_hash fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username_hash VARCHAR(255) UNIQUE;

-- Create index for username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
