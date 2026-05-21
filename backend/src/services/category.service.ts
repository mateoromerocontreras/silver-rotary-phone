import prisma from '../prisma/client';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';
import { CategoryType } from '@prisma/client';

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Groceries', icon: 'shopping-cart', color: '#4CAF50' },
  { name: 'Dining Out', icon: 'utensils', color: '#FF9800' },
  { name: 'Transportation', icon: 'car', color: '#2196F3' },
  { name: 'Housing', icon: 'home', color: '#9C27B0' },
  { name: 'Utilities', icon: 'zap', color: '#607D8B' },
  { name: 'Entertainment', icon: 'film', color: '#E91E63' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#FF5722' },
  { name: 'Healthcare', icon: 'heart', color: '#F44336' },
  { name: 'Education', icon: 'book', color: '#3F51B5' },
  { name: 'Personal Care', icon: 'smile', color: '#00BCD4' },
  { name: 'Subscriptions', icon: 'refresh-cw', color: '#795548' },
  { name: 'Other Expense', icon: 'more-horizontal', color: '#9E9E9E' },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'briefcase', color: '#4CAF50' },
  { name: 'Freelance', icon: 'edit', color: '#8BC34A' },
  { name: 'Investments', icon: 'trending-up', color: '#00BCD4' },
  { name: 'Gifts', icon: 'gift', color: '#FF9800' },
  { name: 'Refunds', icon: 'rotate-ccw', color: '#607D8B' },
  { name: 'Other Income', icon: 'plus-circle', color: '#9E9E9E' },
];

export async function seedDefaultCategories(userId: string) {
  const categories = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
      ...c,
      user_id: userId,
      type: 'EXPENSE' as CategoryType,
      is_default: true,
    })),
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
      ...c,
      user_id: userId,
      type: 'INCOME' as CategoryType,
      is_default: true,
    })),
  ];

  await prisma.category.createMany({ data: categories });
}

export async function listCategories(userId: string, type?: string) {
  const where: Record<string, unknown> = { user_id: userId };
  if (type) {
    where.type = type;
  }
  return prisma.category.findMany({
    where,
    orderBy: [{ is_default: 'desc' }, { name: 'asc' }],
  });
}

export async function createCategory(userId: string, input: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      user_id: userId,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
    },
  });
}

export async function updateCategory(userId: string, id: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findFirst({
    where: { id, user_id: userId },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  if (category.is_default && input.type && input.type !== category.type) {
    throw new ForbiddenError('Cannot change the type of a default category');
  }

  return prisma.category.update({
    where: { id },
    data: input,
  });
}

export async function deleteCategory(userId: string, id: string) {
  const category = await prisma.category.findFirst({
    where: { id, user_id: userId },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const transactionCount = await prisma.transaction.count({
    where: { category_id: id, deleted_at: null },
  });

  if (transactionCount > 0) {
    throw new ConflictError(
      `Cannot delete category: ${transactionCount} transaction(s) still reference it`,
    );
  }

  await prisma.category.delete({ where: { id } });
}
