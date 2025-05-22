import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number' }),
  name: z.string().min(1, { message: 'Name is required' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export const signinSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});