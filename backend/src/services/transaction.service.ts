import prisma from '../prisma/client';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQueryInput,
} from '../validators/transaction';
import { NotFoundError } from '../utils/errors';
import { updateCachedBalance } from './account.service';
import { Prisma } from '@prisma/client';

export async function listTransactions(userId: string, query: TransactionQueryInput) {
  const { page, limit, account_id, category_id, type, date_from, date_to, search, sort, order } =
    query;

  const where: Prisma.TransactionWhereInput = {
    user_id: userId,
    deleted_at: null,
  };

  if (account_id) where.account_id = account_id;
  if (category_id) where.category_id = category_id;
  if (type) where.type = type;

  if (date_from || date_to) {
    where.date = {};
    if (date_from) (where.date as Prisma.DateTimeFilter).gte = new Date(date_from);
    if (date_to) (where.date as Prisma.DateTimeFilter).lte = new Date(date_to);
  }

  if (search) {
    where.description = { contains: search, mode: 'insensitive' };
  }

  const orderBy: Prisma.TransactionOrderByWithRelationInput = { [sort]: order };

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        account: { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  // Verify account belongs to user and is not deleted
  const account = await prisma.account.findFirst({
    where: { id: input.account_id, user_id: userId, deleted_at: null },
  });
  if (!account) throw new NotFoundError('Account not found');

  // Verify category belongs to user
  const category = await prisma.category.findFirst({
    where: { id: input.category_id, user_id: userId },
  });
  if (!category) throw new NotFoundError('Category not found');

  const transaction = await prisma.transaction.create({
    data: {
      user_id: userId,
      account_id: input.account_id,
      category_id: input.category_id,
      type: input.type,
      amount: input.amount,
      description: input.description,
      notes: input.notes,
      date: new Date(input.date),
    },
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  await updateCachedBalance(input.account_id);

  return transaction;
}

export async function getTransaction(userId: string, id: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, user_id: userId, deleted_at: null },
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  return transaction;
}

export async function updateTransaction(userId: string, id: string, input: UpdateTransactionInput) {
  const existing = await prisma.transaction.findFirst({
    where: { id, user_id: userId, deleted_at: null },
  });

  if (!existing) {
    throw new NotFoundError('Transaction not found');
  }

  const data: Record<string, unknown> = { ...input };
  if (input.date) data.date = new Date(input.date);

  // Verify new account if changing
  if (input.account_id && input.account_id !== existing.account_id) {
    const account = await prisma.account.findFirst({
      where: { id: input.account_id, user_id: userId, deleted_at: null },
    });
    if (!account) throw new NotFoundError('Account not found');
  }

  // Verify new category if changing
  if (input.category_id && input.category_id !== existing.category_id) {
    const category = await prisma.category.findFirst({
      where: { id: input.category_id, user_id: userId },
    });
    if (!category) throw new NotFoundError('Category not found');
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data,
    include: {
      account: { select: { id: true, name: true, type: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  // Recalculate balance for affected accounts
  await updateCachedBalance(existing.account_id);
  if (input.account_id && input.account_id !== existing.account_id) {
    await updateCachedBalance(input.account_id);
  }

  return transaction;
}

export async function deleteTransaction(userId: string, id: string) {
  const existing = await prisma.transaction.findFirst({
    where: { id, user_id: userId, deleted_at: null },
  });

  if (!existing) {
    throw new NotFoundError('Transaction not found');
  }

  await prisma.transaction.update({
    where: { id },
    data: { deleted_at: new Date() },
  });

  await updateCachedBalance(existing.account_id);
}
