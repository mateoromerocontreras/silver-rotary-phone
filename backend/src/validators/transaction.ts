import { z } from 'zod';

export const createTransactionSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().int().positive('Amount must be a positive integer (cents)'),
  description: z.string().min(1, 'Description is required').max(255),
  notes: z.string().max(1000).optional(),
  date: z.string().datetime({ message: 'Date must be a valid ISO 8601 string' }),
});

export const updateTransactionSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  amount: z.number().int().positive('Amount must be a positive integer (cents)').optional(),
  description: z.string().min(1).max(255).optional(),
  notes: z.string().max(1000).nullable().optional(),
  date: z.string().datetime().optional(),
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
  sort: z.enum(['date', 'amount', 'created_at']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
