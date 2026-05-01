-- Add username fields to users table
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN username_hash VARCHAR(255) UNIQUE;

-- Create unique index for username
CREATE INDEX idx_users_username ON users(username);

-- Add comments
COMMENT ON COLUMN users.username IS 'Unique username for user profile display';
COMMENT ON COLUMN users.username_hash IS 'Hashed version of username for validation';