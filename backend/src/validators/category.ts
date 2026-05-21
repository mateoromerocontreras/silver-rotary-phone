import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().min(1, 'Icon is required').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  icon: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
