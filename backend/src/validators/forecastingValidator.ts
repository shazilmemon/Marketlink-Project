import { z } from 'zod';

export const generateForecastSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  marketId: z.string().optional(),
  targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid target date ISO string',
  }),
});

export const generateBulkForecastSchema = z.object({
  productIds: z.array(z.string()).min(1, 'At least one product ID is required').max(20),
  marketId: z.string().optional(),
  targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid target date ISO string',
  }),
});

export const forecastQuerySchema = z.object({
  productId: z.string().optional(),
  marketId: z.string().optional(),
  demandLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['VALID', 'INSUFFICIENT_DATA', 'EXPIRED', 'RETIRED']).optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
});

export type GenerateForecastInput = z.infer<typeof generateForecastSchema>;
export type GenerateBulkForecastInput = z.infer<typeof generateBulkForecastSchema>;
export type ForecastQuery = z.infer<typeof forecastQuerySchema>;
