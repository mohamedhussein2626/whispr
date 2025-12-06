-- Fix password field to be optional for Better Auth compatibility
-- This allows social logins (Google) to work without requiring a password

-- Make password field optional in the user table
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON COLUMN "user"."password" IS 'Optional password field - required for email/password auth, null for social logins';
