import { supabase } from "@/integrations/supabase/client";

/**
 * Get a signed URL for a private wardrobe image
 * @param path - The storage path of the image
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns The signed URL or null if error
 */
export const getSignedWardrobeUrl = async (
  path: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('wardrobe')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Unexpected error creating signed URL:', error);
    return null;
  }
};
