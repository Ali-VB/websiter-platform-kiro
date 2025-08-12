-- Fix the INSERT policy that has null qual
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create the correct INSERT policy with proper WITH CHECK condition
CREATE POLICY "Users can insert own profile" ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);