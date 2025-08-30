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
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'extra_large')),
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create improved policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add a more permissive policy for upsert operations
CREATE POLICY "Users can upsert their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Create policies for reviews table
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Create policies for dogs table
CREATE POLICY "Users can view their own dogs" ON dogs
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own dogs" ON dogs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own dogs" ON dogs
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own dogs" ON dogs
  FOR DELETE USING (auth.uid() = owner_id);

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
