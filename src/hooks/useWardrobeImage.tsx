import { useState, useEffect } from "react";
import { getSignedWardrobeUrl } from "@/lib/storage";

/**
 * Hook to get a signed URL for a wardrobe image
 * @param imagePath - The storage path of the image
 * @returns The signed URL or null if loading/error
 */
export const useWardrobeImage = (imagePath: string) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      const url = await getSignedWardrobeUrl(imagePath);
      setSignedUrl(url);
      setLoading(false);
    };

    if (imagePath) {
      loadImage();
    }
  }, [imagePath]);

  return { signedUrl, loading };
};
