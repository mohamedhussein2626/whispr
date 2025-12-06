-- Run this SQL command in your database to fix the password field issue
-- You can run this in your database admin tool (pgAdmin, DBeaver, etc.) or via psql

-- Make password field optional
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON COLUMN "user"."password" IS 'Optional password field - required for email/password auth, null for social logins';

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'user' AND column_name = 'password';


