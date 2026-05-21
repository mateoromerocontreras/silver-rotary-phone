import { z } from 'zod';

export const monthYearQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const monthsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

export type MonthYearQuery = z.infer<typeof monthYearQuerySchema>;
export type MonthsQuery = z.infer<typeof monthsQuerySchema>;
