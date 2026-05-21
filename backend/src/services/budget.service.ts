import prisma from '../prisma/client';
import { CreateBudgetInput, UpdateBudgetInput } from '../validators/budget';
import { NotFoundError } from '../utils/errors';

async function computeSpent(userId: string, categoryId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const result = await prisma.transaction.aggregate({
    where: {
      user_id: userId,
      category_id: categoryId,
      type: 'EXPENSE',
      deleted_at: null,
      date: { gte: startDate, lt: endDate },
    },
    _sum: { amount: true },
  });

  return result._sum.amount || 0;
}

function enrichBudget(
  budget: {
    id: string;
    amount: number;
    month: number;
    year: number;
    category: { id: string; name: string; icon: string; color: string };
    created_at: Date;
    updated_at: Date;
  },
  spent: number,
) {
  const remaining = budget.amount - spent;
  const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 1000) / 10 : 0;

  return {
    id: budget.id,
    category: budget.category,
    amount: budget.amount,
    spent,
    remaining,
    percentage,
    month: budget.month,
    year: budget.year,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
  };
}

export async function listBudgets(userId: string, month?: number, year?: number) {
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();

  const budgets = await prisma.budget.findMany({
    where: { user_id: userId, month: m, year: y },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
    orderBy: { created_at: 'asc' },
  });

  const results = [];
  for (const budget of budgets) {
    const spent = await computeSpent(userId, budget.category_id, m, y);
    results.push(enrichBudget(budget, spent));
  }

  return results;
}

export async function createBudget(userId: string, input: CreateBudgetInput) {
  // Verify category belongs to user
  const category = await prisma.category.findFirst({
    where: { id: input.category_id, user_id: userId },
  });
  if (!category) throw new NotFoundError('Category not found');

  const budget = await prisma.budget.create({
    data: {
      user_id: userId,
      category_id: input.category_id,
      amount: input.amount,
      month: input.month,
      year: input.year,
    },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  const spent = await computeSpent(userId, input.category_id, input.month, input.year);
  return enrichBudget(budget, spent);
}

export async function getBudget(userId: string, id: string) {
  const budget = await prisma.budget.findFirst({
    where: { id, user_id: userId },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  if (!budget) throw new NotFoundError('Budget not found');

  const spent = await computeSpent(userId, budget.category_id, budget.month, budget.year);

  // Get transaction breakdown
  const startDate = new Date(budget.year, budget.month - 1, 1);
  const endDate = new Date(budget.year, budget.month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: userId,
      category_id: budget.category_id,
      type: 'EXPENSE',
      deleted_at: null,
      date: { gte: startDate, lt: endDate },
    },
    orderBy: { date: 'desc' },
    include: {
      account: { select: { id: true, name: true } },
    },
  });

  return {
    ...enrichBudget(budget, spent),
    transactions,
  };
}

export async function updateBudget(userId: string, id: string, input: UpdateBudgetInput) {
  const budget = await prisma.budget.findFirst({
    where: { id, user_id: userId },
  });

  if (!budget) throw new NotFoundError('Budget not found');

  const updated = await prisma.budget.update({
    where: { id },
    data: { amount: input.amount },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  const spent = await computeSpent(userId, budget.category_id, budget.month, budget.year);
  return enrichBudget(updated, spent);
}

export async function deleteBudget(userId: string, id: string) {
  const budget = await prisma.budget.findFirst({
    where: { id, user_id: userId },
  });

  if (!budget) throw new NotFoundError('Budget not found');

  await prisma.budget.delete({ where: { id } });
}
