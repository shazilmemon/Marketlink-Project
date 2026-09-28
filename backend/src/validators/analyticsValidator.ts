import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  preset: z
    .enum([
      'today',
      'yesterday',
      '7d',
      '30d',
      '90d',
      'this_month',
      'previous_month',
      'custom',
    ])
    .optional()
    .default('30d'),
  from: z.string().optional(),
  to: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

/**
 * Parses and computes concrete Date boundaries (startDate, endDate, prevStartDate, prevEndDate)
 * based on preset or custom from/to parameters.
 */
export function parseAnalyticsDateRange(query: AnalyticsQuery): {
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
  preset: string;
} {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (query.preset === 'custom' && query.from && query.to) {
    startDate = new Date(query.from);
    endDate = new Date(query.to);
    if (isNaN(startDate.getTime())) startDate = new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000);
    if (isNaN(endDate.getTime())) endDate = new Date();
  } else {
    switch (query.preset) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        break;
      case 'yesterday': {
        const y = new Date(now.valueOf() - 24 * 60 * 60 * 1000);
        startDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
        endDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
        break;
      }
      case '7d':
        startDate = new Date(now.valueOf() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.valueOf() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      case 'previous_month': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      }
      case '30d':
      default:
        startDate = new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
  }

  // Calculate equivalent previous duration for comparison
  const durationMs = Math.max(endDate.getTime() - startDate.getTime(), 24 * 60 * 60 * 1000);
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - durationMs);

  return {
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    preset: query.preset || '30d',
  };
}
