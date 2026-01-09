-- Migration: Better Auth Admin Plugin
-- This migration adds role management to the user table (Better Auth admin plugin)
-- and removes the role column from user_profiles table

-- Add Better Auth admin plugin fields to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_reason" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_expires" timestamp;

-- Add impersonatedBy to session table for admin impersonation feature
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "impersonated_by" text;

-- Make user_id unique in user_profiles (if not already)
-- This is needed for the upsert to work correctly with the databaseHooks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_user_id_unique'
  ) THEN
    ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_unique" UNIQUE ("user_id");
  END IF;
END $$;

-- Migrate existing roles from user_profiles to user table (lowercase)
UPDATE "user" u
SET role = LOWER(up.role)
FROM "user_profiles" up
WHERE u.id = up.user_id
  AND up.role IS NOT NULL;

-- Set default role for users without profiles or null roles
UPDATE "user" SET role = 'user' WHERE role IS NULL;

-- Drop the role column from user_profiles
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "role";

-- Drop the enum type (after removing the column)
DROP TYPE IF EXISTS "user_role";
