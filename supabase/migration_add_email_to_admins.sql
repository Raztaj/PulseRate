-- Add email column to admins table
ALTER TABLE admins ADD COLUMN email TEXT UNIQUE;

-- Drop FK to auth.users and make user_id optional (internal system, no Supabase Auth)
ALTER TABLE admins ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_user_id_fkey;

-- Disable RLS on all tables (internal system, using service-role key)
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE answers DISABLE ROW LEVEL SECURITY;
