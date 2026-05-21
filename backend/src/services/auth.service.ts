import { v4 as uuidv4 } from 'uuid';
import prisma from '../prisma/client';
import { hashPassword, comparePassword, hashToken } from '../utils/hash';
import { generateAccessToken, verifyRefreshToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { RegisterInput, LoginInput } from '../validators/auth';
import { seedDefaultCategories } from './category.service';

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

async function createTokenPair(userId: string, email: string) {
  const accessToken = generateAccessToken({ userId, email });
  const rawRefreshToken = uuidv4();
  const hashedRefreshToken = hashToken(rawRefreshToken);

  await prisma.refreshToken.create({
    data: {
      user_id: userId,
      token: hashedRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const password_hash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password_hash,
      name: input.name,
    },
  });

  await seedDefaultCategories(user.id);

  const tokens = await createTokenPair(user.id, user.email);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.password_hash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = await createTokenPair(user.id, user.email);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

export async function refresh(rawRefreshToken: string) {
  const hashedToken = hashToken(rawRefreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.expires_at < new Date()) {
    if (storedToken) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    }
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Rotate: delete old, create new
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const tokens = await createTokenPair(storedToken.user.id, storedToken.user.email);

  return {
    user: sanitizeUser(storedToken.user),
    ...tokens,
  };
}

export async function logout(rawRefreshToken: string) {
  const hashedToken = hashToken(rawRefreshToken);
  try {
    await prisma.refreshToken.delete({ where: { token: hashedToken } });
  } catch {
    // Token already deleted or doesn't exist — that's fine
  }
}

// For tests: verify a raw refresh token without consuming it
export { verifyRefreshToken };
