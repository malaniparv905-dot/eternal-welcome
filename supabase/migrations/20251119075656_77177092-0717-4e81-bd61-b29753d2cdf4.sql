-- Make wardrobe storage bucket private to protect user wardrobe images
-- This prevents unauthorized access even if someone discovers image URLs
UPDATE storage.buckets 
SET public = false 
WHERE id = 'wardrobe';

-- Add length constraints to wardrobe_items table for data integrity
ALTER TABLE wardrobe_items 
  ADD CONSTRAINT name_length CHECK (char_length(name) <= 100 AND char_length(name) > 0),
  ADD CONSTRAINT category_length CHECK (char_length(category) <= 50 AND char_length(category) > 0),
  ADD CONSTRAINT dress_code_length CHECK (char_length(dress_code) <= 50 AND char_length(dress_code) > 0),
  ADD CONSTRAINT color_length CHECK (color IS NULL OR (char_length(color) <= 30 AND char_length(color) > 0)),
  ADD CONSTRAINT season_length CHECK (season IS NULL OR (char_length(season) <= 20 AND char_length(season) > 0)),
  ADD CONSTRAINT notes_length CHECK (notes IS NULL OR char_length(notes) <= 1000);

-- Add length constraints to profiles table
ALTER TABLE profiles
  ADD CONSTRAINT full_name_length CHECK (char_length(full_name) <= 100 AND char_length(full_name) > 0);

-- Add length constraints to outfits table
ALTER TABLE outfits
  ADD CONSTRAINT name_length CHECK (char_length(name) <= 100 AND char_length(name) > 0),
  ADD CONSTRAINT occasion_length CHECK (char_length(occasion) <= 50 AND char_length(occasion) > 0);