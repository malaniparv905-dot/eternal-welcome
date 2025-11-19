import { z } from "zod";

// Authentication validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" }),
});

export const signupSchema = loginSchema.extend({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Full name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Full name can only contain letters, spaces, hyphens, and apostrophes" }),
});

// Wardrobe item validation schema
export const wardrobeItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Item name is required" })
    .max(100, { message: "Item name must be less than 100 characters" }),
  category: z
    .string()
    .trim()
    .min(1, { message: "Category is required" })
    .max(50, { message: "Category must be less than 50 characters" }),
  dressCode: z
    .string()
    .trim()
    .min(1, { message: "Dress code is required" })
    .max(50, { message: "Dress code must be less than 50 characters" }),
  color: z
    .string()
    .trim()
    .max(30, { message: "Color must be less than 30 characters" })
    .optional()
    .or(z.literal("")),
  season: z
    .string()
    .trim()
    .max(20, { message: "Season must be less than 20 characters" })
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional()
    .or(z.literal("")),
});

// Outfit validation schema
export const outfitGenerationSchema = z.object({
  occasion: z
    .string()
    .trim()
    .min(1, { message: "Occasion is required" })
    .max(50, { message: "Occasion must be less than 50 characters" }),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string().max(100),
        category: z.string().max(50),
        dress_code: z.string().max(50),
        color: z.string().max(30).nullable(),
      })
    )
    .min(3, { message: "At least 3 items are required" }),
});

// File validation
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a valid image file (JPEG, PNG, or WebP)",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Image file size must be less than 5MB",
    };
  }

  return { valid: true };
};

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type WardrobeItemInput = z.infer<typeof wardrobeItemSchema>;
export type OutfitGenerationInput = z.infer<typeof outfitGenerationSchema>;
