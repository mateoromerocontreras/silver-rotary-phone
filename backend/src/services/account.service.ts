import prisma from '../prisma/client';
import { CreateAccountInput, UpdateAccountInput } from '../validators/account';
import { NotFoundError } from '../utils/errors';

async function computeBalance(accountId: string): Promise<number> {
  const result = await prisma.transaction.groupBy({
    by: ['type'],
    where: { account_id: accountId, deleted_at: null },
    _sum: { amount: true },
  });

  let balance = 0;
  for (const row of result) {
    const sum = row._sum.amount || 0;
    if (row.type === 'INCOME') {
      balance += sum;
    } else if (row.type === 'EXPENSE') {
      balance -= sum;
    }
    // TRANSFER transactions don't affect the originating account's balance in this simple model
  }

  return balance;
}

async function updateCachedBalance(accountId: string) {
  const balance = await computeBalance(accountId);
  await prisma.account.update({
    where: { id: accountId },
    data: { balance },
  });
  return balance;
}

export async function listAccounts(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { user_id: userId, deleted_at: null },
    orderBy: { created_at: 'asc' },
  });

  // Recompute balances
  const results = [];
  for (const account of accounts) {
    const balance = await computeBalance(account.id);
    results.push({ ...account, balance });
  }
  return results;
}

export async function createAccount(userId: string, input: CreateAccountInput) {
  const account = await prisma.account.create({
    data: {
      user_id: userId,
      name: input.name,
      type: input.type,
      institution: input.institution,
      color: input.color,
      icon: input.icon,
      balance: input.balance || 0,
    },
  });

  // If initial balance provided, create an adjustment transaction
  if (input.balance && input.balance !== 0) {
    // Find or use "Other Income" / "Other Expense" category
    const categoryType = input.balance > 0 ? 'INCOME' : 'EXPENSE';
    const categoryName = input.balance > 0 ? 'Other Income' : 'Other Expense';

    const category = await prisma.category.findFirst({
      where: { user_id: userId, name: categoryName, type: categoryType },
    });

    if (category) {
      await prisma.transaction.create({
        data: {
          user_id: userId,
          account_id: account.id,
          category_id: category.id,
          type: categoryType,
          amount: Math.abs(input.balance),
          description: 'Initial balance',
          date: new Date(),
        },
      });
    }
  }

  return account;
}

export async function getAccount(userId: string, id: string) {
  const account = await prisma.account.findFirst({
    where: { id, user_id: userId, deleted_at: null },
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  const balance = await computeBalance(account.id);
  return { ...account, balance };
}

export async function updateAccount(userId: string, id: string, input: UpdateAccountInput) {
  const account = await prisma.account.findFirst({
    where: { id, user_id: userId, deleted_at: null },
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  return prisma.account.update({
    where: { id },
    data: input,
  });
}

export async function deleteAccount(userId: string, id: string) {
  const account = await prisma.account.findFirst({
    where: { id, user_id: userId, deleted_at: null },
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  await prisma.account.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}

export { updateCachedBalance };
