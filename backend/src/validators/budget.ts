import { z } from 'zod';

export const createBudgetSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().int().positive('Amount must be a positive integer (cents)'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export const updateBudgetSchema = z.object({
  amount: z.number().int().positive('Amount must be a positive integer (cents)'),
});

export const budgetQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetQueryInput = z.infer<typeof budgetQuerySchema>;
