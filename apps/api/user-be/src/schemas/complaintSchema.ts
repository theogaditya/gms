import { z } from 'zod';
import { ComplaintStatus, ComplaintUrgency } from '@prisma/client';

// Base complaint schema for creation - using categoryName instead of categoryId
export const createComplaintSchema = z.object({
categoryName: z.string()
    .min(2, { message: "Category name must be at least 2 characters long" })
    .max(100, { message: "Category name cannot exceed 100 characters" })
    .trim()
    .refine((val) => val.length > 0, {
      message: "Category name is required"
    }),
  
  subCategory: z.string()
    .min(3, { message: "Sub-category must be at least 3 characters long" })
    .max(100, { message: "Sub-category cannot exceed 100 characters" })
    .trim()
    .refine((val) => val.length > 0, {
      message: "Sub-category is required"
    }),
  
  description: z.string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(1000, { message: "Description cannot exceed 1000 characters" })
    .trim()
    .refine((val) => val.length > 0, {
      message: "Description is required"
    }),
  
  urgency: z.nativeEnum(ComplaintUrgency, {
    errorMap: () => ({ message: "Please select a valid urgency level" })
  }).default(ComplaintUrgency.LOW),
  
  isPublic: z.boolean({
    required_error: "Please specify if complaint should be public"
  }),
  
  // Location details
  location: z.object({
    pin: z.string()
      .min(6, { message: "PIN code must be at least 6 characters" })
      .max(10, { message: "PIN code cannot exceed 10 characters" })
      .regex(/^\d+$/, { message: "PIN code must contain only numbers" }),
    
    district: z.string()
      .min(2, { message: "District name must be at least 2 characters" })
      .max(50, { message: "District name cannot exceed 50 characters" })
      .trim(),
    
    city: z.string()
      .min(2, { message: "City name must be at least 2 characters" })
      .max(50, { message: "City name cannot exceed 50 characters" })
      .trim(),
    
    locality: z.string()
      .min(2, { message: "Locality name must be at least 2 characters" })
      .max(100, { message: "Locality name cannot exceed 100 characters" })
      .trim(),
    
    street: z.string()
      .max(100, { message: "Street name cannot exceed 100 characters" })
      .trim()
      .optional(),
    
    latitude: z.number()
      .min(-90, { message: "Invalid latitude" })
      .max(90, { message: "Invalid latitude" })
      .nullish(),
    
    longitude: z.number()
      .min(-180, { message: "Invalid longitude" })
      .max(180, { message: "Invalid longitude" })
      .nullish()
  }),
  
  // Optional attachment URL (will be set after R2 upload)
  attachmentUrl: z.string().url().nullish()
});

// Schema for updating complaint status (admin operations)
export const updateComplaintStatusSchema = z.object({
  status: z.nativeEnum(ComplaintStatus, {
    errorMap: () => ({ message: "Please select a valid status" })
  }),
  
  escalationLevel: z.string()
    .max(50, { message: "Escalation level cannot exceed 50 characters" })
    .optional(),
  
  sla: z.string()
    .max(100, { message: "SLA cannot exceed 100 characters" })
    .optional()
});

// Schema for upvote/downvote operations
export const upvoteSchema = z.object({
  complaintId: z.string().uuid({
    message: "Invalid complaint ID"
  })
});

// Query parameters for fetching complaints
export const getComplaintsQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/, { message: "Page must be a number" })
    .transform(Number)
    .refine((val) => val > 0, { message: "Page must be greater than 0" })
    .default("1")
    .transform(String),
  
  limit: z.string()
    .regex(/^\d+$/, { message: "Limit must be a number" })
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, { message: "Limit must be between 1 and 100" })
    .default("10")
    .transform(String),
  
  categoryName: z.string().trim().optional(), // Changed from categoryId to categoryName
  
  status: z.nativeEnum(ComplaintStatus).optional(),
  
  urgency: z.nativeEnum(ComplaintUrgency).optional(),
  
  isPublic: z.string()
    .transform((val) => val === 'true')
    .optional(),
  
  district: z.string().trim().optional(),
  
  city: z.string().trim().optional()
});

// Type exports for use in routes
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
export type UpvoteInput = z.infer<typeof upvoteSchema>;
export type GetComplaintsQuery = z.infer<typeof getComplaintsQuerySchema>;