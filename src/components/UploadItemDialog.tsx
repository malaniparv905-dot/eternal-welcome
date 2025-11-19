import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2 } from "lucide-react";
import { wardrobeItemSchema, validateImageFile } from "@/lib/validation";

interface UploadItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

const DRESS_CODES = ["Casual", "Formal", "Business", "Party", "Athletic", "Streetwear"];
const CATEGORIES = ["Top", "Bottom", "Dress", "Outerwear", "Shoes", "Accessories"];
const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All Season"];

export default function UploadItemDialog({ open, onOpenChange, onUploadComplete }: UploadItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    dressCode: "",
    color: "",
    season: "",
    notes: ""
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid File",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationResult = wardrobeItemSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Missing Image",
        description: "Please upload an image",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('wardrobe')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Store the file path instead of public URL since bucket is now private
      const imagePath = fileName;

      // Save item to database
      const { error: dbError } = await supabase
        .from('wardrobe_items')
        .insert({
          user_id: user.id,
          image_url: imagePath,
          name: validationResult.data.name,
          category: validationResult.data.category,
          dress_code: validationResult.data.dressCode,
          color: validationResult.data.color || null,
          season: validationResult.data.season || null,
          notes: validationResult.data.notes || null
        });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Item added to your wardrobe"
      });

      // Reset form
      setImageFile(null);
      setImagePreview("");
      setFormData({
        name: "",
        category: "",
        dressCode: "",
        color: "",
        season: "",
        notes: ""
      });
      onUploadComplete();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Item</DialogTitle>
          <DialogDescription>Add a new item to your wardrobe</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />

          {imagePreview && (
            <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Blue Denim Jacket"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dressCode">Dress Code *</Label>
              <Select value={formData.dressCode} onValueChange={(value) => setFormData({ ...formData, dressCode: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dress code" />
                </SelectTrigger>
                <SelectContent>
                  {DRESS_CODES.map((code) => (
                    <SelectItem key={code} value={code}>{code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g., Blue"
              />
            </div>

            <div>
              <Label htmlFor="season">Season</Label>
              <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {SEASONS.map((season) => (
                    <SelectItem key={season} value={season}>{season}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional details..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Item
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}