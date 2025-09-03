-- This seed file contains only essential data and sample data
-- The complete schema is handled by the migration file

-- Insert sample data for testing (optional)
-- You can add sample profiles, dogs, availability posts, etc. here if needed

-- Example: Insert a test profile (uncomment if you want sample data)
-- INSERT INTO profiles (id, email, first_name, last_name, city, state) 
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'test@example.com',
--   'Test',
--   'User',
--   'San Francisco',
--   'CA'
-- ) ON CONFLICT (id) DO NOTHING;

-- The migration file already handles:
-- - All table creation
-- - All indexes
-- - All RLS policies
-- - All triggers and functions
-- - Row Level Security setup

-- This file is intentionally minimal to avoid conflicts with the migration
