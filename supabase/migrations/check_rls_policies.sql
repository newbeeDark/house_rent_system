-- Check if there are any RLS policies on users table that might block inserts
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';