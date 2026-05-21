import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO 4217 code').optional(),
  avatar_url: z.string().url().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const pushTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  platform: z.enum(['ANDROID', 'IOS']),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PushTokenInput = z.infer<typeof pushTokenSchema>;
