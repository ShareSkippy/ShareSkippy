-- Add dog ID columns to meetings table
-- This fixes the foreign key relationship errors

-- Add the dog ID columns
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS requester_dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recipient_dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_requester_dog_id ON meetings(requester_dog_id);
CREATE INDEX IF NOT EXISTS idx_meetings_recipient_dog_id ON meetings(recipient_dog_id);

-- Update existing meetings to set dog IDs (optional - links to users' first dogs)
-- This is helpful if you have existing meetings without dog associations
UPDATE meetings 
SET requester_dog_id = (
  SELECT id FROM dogs 
  WHERE owner_id = meetings.requester_id 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE requester_dog_id IS NULL;

UPDATE meetings 
SET recipient_dog_id = (
  SELECT id FROM dogs 
  WHERE owner_id = meetings.recipient_id 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE recipient_dog_id IS NULL;
