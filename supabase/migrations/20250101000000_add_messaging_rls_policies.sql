-- Add missing tables and RLS policies for messaging system
-- This migration creates the availability, conversations and messages tables and adds necessary policies

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
  dog_ids UUID[] DEFAULT '{}',
  post_type TEXT CHECK (post_type IN ('dog_available', 'petpal_available')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  availability_notes TEXT,
  special_instructions TEXT,
  is_urgent BOOLEAN DEFAULT false,
  urgency_notes TEXT,
  can_pick_up_drop_off BOOLEAN DEFAULT false,
  preferred_meeting_location TEXT,
  use_profile_location BOOLEAN DEFAULT true,
  custom_location_address TEXT,
  custom_location_neighborhood TEXT,
  custom_location_city TEXT,
  custom_location_state TEXT,
  custom_location_zip_code TEXT,
  custom_location_lat DECIMAL,
  custom_location_lng DECIMAL,
  display_lat DECIMAL,
  display_lng DECIMAL,
  city_label TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dogs table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS dogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  birthday DATE,
  age_years INTEGER DEFAULT 0,
  age_months INTEGER DEFAULT 0,
  size TEXT CHECK (size IN ('0-10', '11-25', '26-40', '41-70', '71-90', '91-110')),
  photo_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  neutered BOOLEAN DEFAULT false,
  temperament TEXT[],
  energy_level TEXT CHECK (energy_level IN ('low', 'moderate', 'high')),
  dog_friendly BOOLEAN DEFAULT true,
  cat_friendly BOOLEAN DEFAULT false,
  kid_friendly BOOLEAN DEFAULT false,
  leash_trained BOOLEAN DEFAULT false,
  crate_trained BOOLEAN DEFAULT false,
  house_trained BOOLEAN DEFAULT false,
  fully_vaccinated BOOLEAN DEFAULT false,
  activities TEXT[],
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  availability_id UUID REFERENCES availability(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table to group messages
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  availability_id UUID REFERENCES availability(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id, availability_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_availability_id ON messages(availability_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_id ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_availability_id ON conversations(availability_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

-- Enable RLS for all tables
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for availability table
CREATE POLICY "Users can view all active availability posts" ON availability
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own availability posts" ON availability
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own availability posts" ON availability
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own availability posts" ON availability
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own availability posts" ON availability
  FOR DELETE USING (auth.uid() = owner_id);

-- Create policies for dogs table
CREATE POLICY "Users can view their own dogs" ON dogs
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own dogs" ON dogs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own dogs" ON dogs
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own dogs" ON dogs
  FOR DELETE USING (auth.uid() = owner_id);

-- Create policies for conversations table
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update conversations they participate in" ON conversations
  FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Create policies for messages table
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);
