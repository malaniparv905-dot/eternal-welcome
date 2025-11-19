import { useWardrobeImage } from "@/hooks/useWardrobeImage";
import { Loader2 } from "lucide-react";

interface WardrobeImageProps {
  imagePath: string;
  alt: string;
  className?: string;
}

export default function WardrobeImage({ imagePath, alt, className = "" }: WardrobeImageProps) {
  const { signedUrl, loading } = useWardrobeImage(imagePath);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <span className="text-sm text-muted-foreground">Image unavailable</span>
      </div>
    );
  }

  return (
    <img 
      src={signedUrl} 
      alt={alt}
      className={className}
    />
  );
}
