import prisma from '../prisma/client';
import { hashPassword, comparePassword } from '../utils/hash';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { UpdateUserInput, ChangePasswordInput, PushTokenInput } from '../validators/user';

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  currency: string;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    currency: user.currency,
    avatar_url: user.avatar_url,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return sanitizeUser(user);
}

export async function updateProfile(userId: string, input: UpdateUserInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
  });
  return sanitizeUser(user);
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const valid = await comparePassword(input.currentPassword, user.password_hash);
  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const password_hash = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash },
  });
}

export async function registerPushToken(userId: string, input: PushTokenInput) {
  return prisma.pushToken.upsert({
    where: { token: input.token },
    update: { user_id: userId, platform: input.platform },
    create: {
      user_id: userId,
      token: input.token,
      platform: input.platform,
    },
  });
}
