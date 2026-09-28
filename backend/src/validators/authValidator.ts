import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.enum(['CUSTOMER', 'FARMER', 'PARTNER']).optional().default('CUSTOMER'),
    farmName: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

export const farmerApplySchema = z.object({
  body: z.object({
    farmName: z.string().min(2, 'Farm name must be at least 2 characters'),
    bio: z.string().optional(),
  }),
});

export const farmerVerifySchema = z.object({
  body: z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Farmer profile ID is required'),
  }),
});
