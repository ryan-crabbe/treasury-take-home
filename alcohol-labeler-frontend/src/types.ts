import { z } from "zod";

// TypeScript interfaces
export interface AlcoholLabelForm {
  brandName: string;
  productClass: string;
  alcoholContent: number;
  netContents?: string;
  labelImage: File | null;
}

export type AlcoholContentInput = string | number;

// Zod validation schemas
export const alcoholLabelSchema = z.object({
  brandName: z
    .string()
    .min(1, "Brand name is required")
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be less than 100 characters"),
  
  productClass: z
    .string()
    .min(1, "Product class/type is required")
    .min(2, "Product class must be at least 2 characters")
    .max(100, "Product class must be less than 100 characters"),
  
  alcoholContent: z
    .number()
    .min(0, "Alcohol content must be 0% or higher")
    .max(100, "Alcohol content cannot exceed 100%")
    .refine((val) => val >= 0 && val <= 100, {
      message: "Alcohol content must be between 0% and 100%"
    }),
  
  netContents: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: "Net contents must be at least 2 characters if provided"
    }),
  
  labelImage: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Please select an image file")
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB limit
      "Image file must be less than 10MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    )
    .nullable()
    .refine((file) => file !== null, "Label image is required")
});

export type AlcoholLabelFormData = z.infer<typeof alcoholLabelSchema>;

// Extracted data from the label image (what the backend AI sees)
export interface ExtractedLabelData {
  brandName?: string;
  productClass?: string;
  alcoholContent?: number;
  netContents?: string;
}

// Form submission response types
export type ValidationIssues = Partial<
  Record<keyof AlcoholLabelFormData | "general", string>
>;

export interface ValidationResponse {
  id: string;              // generated per submission
  createdAt: string;       // ISO timestamp
  success: boolean;        // true if there are no blocking issues
  formData: AlcoholLabelFormData; // echo back the submitted data
  extracted?: ExtractedLabelData; // optional but helpful for UI explanations
  issues?: ValidationIssues;      // e.g., { brandName: "Did not match label", general: "ABV out of range" }
}
