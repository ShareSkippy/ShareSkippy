-- Fix the account deletion constraint issue
-- Run this in your Supabase SQL Editor

-- Drop the problematic constraint if it exists
ALTER TABLE account_deletion_requests DROP CONSTRAINT IF EXISTS unique_active_deletion_request;

-- Create a partial unique index that only applies to pending requests
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_deletion_request 
ON account_deletion_requests(user_id) 
WHERE status = 'pending';
