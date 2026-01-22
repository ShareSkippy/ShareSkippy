-- RLS fix to ensure availability posts and relations are visible.

-- Ensure API role has access for internal operations
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Ensure RLS is actually enabled (Reset scripts often fail if this state is inconsistent)
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- 1. Public Access: Allow authenticated users to view active posts.
DROP POLICY IF EXISTS "Users can view all active availability posts" ON availability;
CREATE POLICY "Users can view all active availability posts" 
  ON availability
  FOR SELECT 
  TO authenticated
  USING (status = 'active');

-- 2. Owner Access: Allow users to view their own posts regardless of status.
DROP POLICY IF EXISTS "Users can view their own availability posts" ON availability;
CREATE POLICY "Users can view their own availability posts" 
  ON availability
  FOR SELECT 
  TO authenticated
  USING (((auth.uid()) = owner_id));