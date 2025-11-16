-- Create policy to allow service role to insert users
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT TO service_role
  WITH CHECK (true);