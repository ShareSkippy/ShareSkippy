# Fix Profile Save Issue - Missing Database Columns

## Problem
The error `Database error: Could not find the 'city' column of 'profiles' in the schema cache (Code: PGRST204)` indicates that your database is missing the `city` and `neighborhood` columns that the application code expects.

## Solution

### Step 1: Add Missing Columns to Database

1. **Go to your Supabase Dashboard**
   - Navigate to your project
   - Go to the SQL Editor

2. **Run the Migration Script**
   Copy and paste this SQL into the SQL Editor and run it:

```sql
-- Migration script to add missing columns to profiles table
-- Run this in your Supabase SQL editor

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS neighborhood text;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('city', 'neighborhood')
ORDER BY column_name;
```

3. **Verify the Migration**
   You should see output showing that both `city` and `neighborhood` columns were added.

### Step 2: Test the Fix

1. **Refresh your application**
2. **Try saving a profile again**
3. **Check the browser console** for any remaining errors

### Step 3: If Issues Persist

If you still get errors, try these additional steps:

1. **Clear browser cache and cookies**
2. **Log out and log back in**
3. **Check the browser console** for detailed error messages

## What Was Fixed

- ✅ Added missing `city` column to profiles table
- ✅ Added missing `neighborhood` column to profiles table  
- ✅ Updated code to handle missing columns gracefully
- ✅ Improved error handling for database schema mismatches

## Database Schema Comparison

**Before (Current Database):**
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  role text,
  -- ... other columns ...
  street_address text,
  state text,
  zip_code text,
  -- Missing: city, neighborhood
);
```

**After (After Migration):**
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  role text,
  -- ... other columns ...
  street_address text,
  state text,
  zip_code text,
  city text,           -- ✅ Added
  neighborhood text,   -- ✅ Added
);
```

## Verification

After running the migration, you can verify the columns exist by running:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('city', 'neighborhood');
```

This should return:
```
column_name   | data_type
--------------|----------
city          | text
neighborhood  | text
```

## Next Steps

1. Run the migration script
2. Test profile saving
3. If successful, you can now use the location features
4. If any issues remain, check the browser console for specific error messages
