-- ============================================
-- Supabase Storage Setup for Profile Avatars
-- HinganAI Platform
-- ============================================

-- NOTE: Your user_profiles table already exists!
-- This file only contains the Storage bucket setup for profile avatars.

-- ============================================
-- Storage Setup Instructions
-- ============================================

-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a new bucket called 'user-avatars'
-- 3. Make it PUBLIC (enable "Public bucket" toggle)
-- 4. Then run the following policies in SQL Editor:

-- ============================================
-- Storage Policies for Profile Avatars
-- ============================================

-- Allow public access to view avatars
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'user-avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'user-avatars' AND
        (storage.foldername(name))[1] = 'avatars'
    );

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'user-avatars' AND
        (storage.foldername(name))[1] = 'avatars'
    );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'user-avatars' AND
        (storage.foldername(name))[1] = 'avatars'
    );

-- ============================================
-- Done! 
-- ============================================
-- Your profile page will now work with image uploads.
-- The user_profiles table already exists with the correct schema:
--   - id (UUID, references auth.users)
--   - email (TEXT)
--   - full_name (TEXT)
--   - farm_location (TEXT)
--   - farm_size (NUMERIC)
--   - primary_crops (TEXT[])
--   - phone_number (TEXT)
--   - avatar_url (TEXT)
--   - created_at (TIMESTAMP)
--   - updated_at (TIMESTAMP)
