-- Add username and username_hash fields to users table
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN username_hash VARCHAR(255) UNIQUE;

-- Create index for username
CREATE INDEX idx_users_username ON users(username);