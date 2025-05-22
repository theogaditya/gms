import { z } from 'zod';

const locationSchema = z.object({
  pin: z.string().min(1, "PIN code is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  locality: z.string(),
  street: z.string(),
  municipal: z.string(),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
  }, "Invalid date of birth or future date"),
  aadhaarId: z.string().min(12, "Aadhaar ID must be 12 digits").max(12, "Aadhaar ID must be 12 digits"),
  preferredLanguage: z.string().optional(),
  disability: z.string().optional(),
  location: locationSchema,
});

export const signinSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});