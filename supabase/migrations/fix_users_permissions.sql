-- Grant permissions for service role to manage users table
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON SEQUENCE public.users_id_seq TO service_role;

-- Grant permissions for anon and authenticated roles to read users
GRANT SELECT ON TABLE public.users TO anon;
GRANT SELECT ON TABLE public.users TO authenticated;

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view all users
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT TO authenticated
  USING (true);

-- Allow anon users to view basic user info
CREATE POLICY "Anon users can view basic user info" ON public.users
  FOR SELECT TO anon
  USING (true);