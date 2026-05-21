import { PrismaClient } from '@prisma/client';
import app from '../app';
import { generateAccessToken } from '../utils/jwt';
import { hashPassword } from '../utils/hash';

export const prisma = new PrismaClient();

export { app };

export async function cleanDatabase() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables.length > 0) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch {
      // Tables might not exist yet
    }
  }
}

export async function createTestUser(overrides?: { email?: string; name?: string }) {
  const password_hash = await hashPassword('testpassword123');
  const user = await prisma.user.create({
    data: {
      email: overrides?.email || 'test@example.com',
      password_hash,
      name: overrides?.name || 'Test User',
    },
  });
  return user;
}

export async function createTestUserWithCategories() {
  const user = await createTestUser();

  const expenseCategory = await prisma.category.create({
    data: {
      user_id: user.id,
      name: 'Groceries',
      type: 'EXPENSE',
      icon: 'shopping-cart',
      color: '#4CAF50',
      is_default: true,
    },
  });

  const incomeCategory = await prisma.category.create({
    data: {
      user_id: user.id,
      name: 'Salary',
      type: 'INCOME',
      icon: 'briefcase',
      color: '#4CAF50',
      is_default: true,
    },
  });

  return { user, expenseCategory, incomeCategory };
}

export function getAuthToken(userId: string, email = 'test@example.com') {
  return generateAccessToken({ userId, email });
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
