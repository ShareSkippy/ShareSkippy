-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  role TEXT,
  emergency_contact_name TEXT,
  emergency_contact_number TEXT,
  emergency_contact_email TEXT,
  bio TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  airbnb_url TEXT,
  other_social_url TEXT,
  community_support_badge TEXT,
  support_preferences TEXT[],
  support_story TEXT,
  other_support_description TEXT,
  profile_photo_url TEXT,
  display_lat DECIMAL,
  display_lng DECIMAL,
  neighborhood TEXT,
  city TEXT,
  street_address TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

<<<<<<< HEAD
-- Create reviews table (for the ratings feature)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dogs table
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

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE, -- Keep for backward compatibility
  dog_ids UUID[] DEFAULT '{}', -- New field for multiple dogs
  post_type TEXT CHECK (post_type IN ('dog_available', 'petpal_available')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  availability_notes TEXT,
  special_instructions TEXT,
  is_urgent BOOLEAN DEFAULT false,
  urgency_notes TEXT,
  can_pick_up_drop_off BOOLEAN DEFAULT false,
  preferred_meeting_location TEXT,
  
  -- Location fields
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
  
  -- Time fields
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_recurring BOOLEAN DEFAULT false,
  recurring_days TEXT[], -- ['monday', 'tuesday', etc.]
  recurring_start_date DATE,
  recurring_end_date DATE,
  
  -- Status and visibility
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  
  -- Contact preferences
  contact_preferences TEXT[] DEFAULT '{}', -- ['email', 'phone', 'text', 'in_app']
  response_time_expectation TEXT,
  
  -- Additional fields
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('meetup', 'training', 'playdate', 'other')),
  location_name TEXT,
  location_address TEXT,
  location_neighborhood TEXT,
  location_city TEXT,
  location_state TEXT,
  location_zip_code TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern TEXT, -- 'weekly', 'monthly', etc.
  recurring_end_date DATE,
  tags TEXT[] DEFAULT '{}',
  photo_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dog_ids UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'declined', 'maybe')),
  notes TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, participant_id)
);

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  place_type TEXT CHECK (place_type IN ('park', 'trail', 'beach', 'cafe', 'restaurant', 'store', 'other')),
  description TEXT,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  lat DECIMAL,
  lng DECIMAL,
  website_url TEXT,
  phone_number TEXT,
  hours TEXT,
  dog_friendly_features TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create place_reviews table
CREATE TABLE IF NOT EXISTS place_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(place_id, reviewer_id)
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

-- Create support_requests table
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  support_type TEXT CHECK (support_type IN ('dog_sitting', 'dog_walking', 'training_help', 'medical_advice', 'equipment_loan', 'other')),
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
  preferred_contact_method TEXT[] DEFAULT '{}',
  location_preference TEXT,
  time_preference TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'closed')),
  assigned_volunteer_id UUID REFERENCES profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_offers table
CREATE TABLE IF NOT EXISTS support_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  support_request_id UUID REFERENCES support_requests(id) ON DELETE CASCADE,
  message TEXT,
  proposed_schedule TEXT,
  proposed_location TEXT,
  proposed_rate TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('message', 'availability_update', 'event_reminder', 'support_request', 'system')),
  related_id UUID, -- Generic reference to related entity
  related_type TEXT, -- Type of related entity
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
  privacy_level TEXT DEFAULT 'community' CHECK (privacy_level IN ('private', 'friends_only', 'community', 'public')),
  location_sharing BOOLEAN DEFAULT true,
  profile_visibility BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_neighborhood ON profiles(neighborhood);
CREATE INDEX IF NOT EXISTS idx_dogs_owner_id ON dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_availability_owner_id ON availability(owner_id);
CREATE INDEX IF NOT EXISTS idx_availability_post_type ON availability(post_type);
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability(status);
CREATE INDEX IF NOT EXISTS idx_availability_start_date ON availability(start_date);
CREATE INDEX IF NOT EXISTS idx_availability_city ON availability(city_label);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_places_place_type ON places(place_type);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_availability_id ON messages(availability_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_id ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_availability_id ON conversations(availability_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_support_requests_requester_id ON support_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Dogs policies
CREATE POLICY "Users can view their own dogs" ON dogs
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own dogs" ON dogs
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own dogs" ON dogs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own dogs" ON dogs
  FOR DELETE USING (auth.uid() = owner_id);

-- Availability policies
CREATE POLICY "Users can view all active availability posts" ON availability
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own availability posts" ON availability
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage their own availability posts" ON availability
  FOR ALL USING (auth.uid() = owner_id);

-- Events policies
CREATE POLICY "Users can view all events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Users can manage events they organize" ON events
  FOR ALL USING (auth.uid() = organizer_id);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations they participate in" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update conversations they participate in" ON conversations
  FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Support requests policies
CREATE POLICY "Users can view support requests" ON support_requests
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own support requests" ON support_requests
  FOR ALL USING (auth.uid() = requester_id);

-- Places policies
CREATE POLICY "Users can view all places" ON places
  FOR SELECT USING (true);

CREATE POLICY "Users can insert places" ON places
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON dogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_requests_updated_at BEFORE UPDATE ON support_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_offers_updated_at BEFORE UPDATE ON support_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
=======
-- Enable RLS for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
>>>>>>> 9281e04509cd454d61586d07b26918dc23c26abd

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
<<<<<<< HEAD
=======

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add a more permissive policy for upsert operations
CREATE POLICY "Users can upsert their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
>>>>>>> 9281e04509cd454d61586d07b26918dc23c26abd
