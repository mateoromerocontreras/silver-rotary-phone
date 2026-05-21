import { PrismaClient, TransactionType, CategoryType, AccountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password_hash: passwordHash,
      name: 'Demo User',
      currency: 'USD',
    },
  });

  console.log(`Created demo user: ${user.email}`);

  // Seed categories (skip if they already exist for this user)
  const existingCategories = await prisma.category.count({ where: { user_id: user.id } });
  if (existingCategories === 0) {
    const categoryData = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
        ...c,
        user_id: user.id,
        type: 'EXPENSE' as CategoryType,
        is_default: true,
      })),
      ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
        ...c,
        user_id: user.id,
        type: 'INCOME' as CategoryType,
        is_default: true,
      })),
    ];
    await prisma.category.createMany({ data: categoryData });
  }

  const categories = await prisma.category.findMany({ where: { user_id: user.id } });
  console.log(`Created ${categories.length} categories`);

  const getCategoryId = (name: string) => categories.find((c) => c.name === name)?.id || '';

  // Create accounts
  const checkingAccount = await prisma.account.create({
    data: {
      user_id: user.id,
      name: 'Chase Checking',
      type: AccountType.CHECKING,
      institution: 'Chase',
      color: '#1A73E8',
      icon: 'building',
      balance: 0,
    },
  });

  const savingsAccount = await prisma.account.create({
    data: {
      user_id: user.id,
      name: 'Ally Savings',
      type: AccountType.SAVINGS,
      institution: 'Ally Bank',
      color: '#9C27B0',
      icon: 'piggy-bank',
      balance: 0,
    },
  });

  const creditCard = await prisma.account.create({
    data: {
      user_id: user.id,
      name: 'Amex Gold',
      type: AccountType.CREDIT_CARD,
      institution: 'American Express',
      color: '#FF9800',
      icon: 'credit-card',
      balance: 0,
    },
  });

  console.log('Created 3 accounts');

  // Create sample transactions over the last 3 months
  const now = new Date();
  const transactions = [
    // Current month income
    { account: checkingAccount.id, category: 'Salary', type: 'INCOME' as TransactionType, amount: 500000, desc: 'Monthly Salary', daysAgo: 2 },
    { account: checkingAccount.id, category: 'Freelance', type: 'INCOME' as TransactionType, amount: 150000, desc: 'Web Development Project', daysAgo: 10 },

    // Current month expenses
    { account: creditCard.id, category: 'Groceries', type: 'EXPENSE' as TransactionType, amount: 8500, desc: 'Whole Foods Market', daysAgo: 1 },
    { account: creditCard.id, category: 'Groceries', type: 'EXPENSE' as TransactionType, amount: 6200, desc: 'Trader Joe\'s', daysAgo: 5 },
    { account: creditCard.id, category: 'Dining Out', type: 'EXPENSE' as TransactionType, amount: 4500, desc: 'Chipotle', daysAgo: 3 },
    { account: creditCard.id, category: 'Dining Out', type: 'EXPENSE' as TransactionType, amount: 7800, desc: 'Italian Restaurant', daysAgo: 7 },
    { account: checkingAccount.id, category: 'Housing', type: 'EXPENSE' as TransactionType, amount: 150000, desc: 'Monthly Rent', daysAgo: 1 },
    { account: checkingAccount.id, category: 'Utilities', type: 'EXPENSE' as TransactionType, amount: 12000, desc: 'Electric Bill', daysAgo: 5 },
    { account: creditCard.id, category: 'Transportation', type: 'EXPENSE' as TransactionType, amount: 5000, desc: 'Gas Station', daysAgo: 4 },
    { account: creditCard.id, category: 'Entertainment', type: 'EXPENSE' as TransactionType, amount: 1599, desc: 'Netflix Subscription', daysAgo: 8 },
    { account: creditCard.id, category: 'Shopping', type: 'EXPENSE' as TransactionType, amount: 4999, desc: 'Amazon Purchase', daysAgo: 6 },
    { account: creditCard.id, category: 'Subscriptions', type: 'EXPENSE' as TransactionType, amount: 999, desc: 'Spotify Premium', daysAgo: 12 },

    // Last month
    { account: checkingAccount.id, category: 'Salary', type: 'INCOME' as TransactionType, amount: 500000, desc: 'Monthly Salary', daysAgo: 32 },
    { account: creditCard.id, category: 'Groceries', type: 'EXPENSE' as TransactionType, amount: 12500, desc: 'Weekly Groceries', daysAgo: 35 },
    { account: creditCard.id, category: 'Groceries', type: 'EXPENSE' as TransactionType, amount: 9800, desc: 'Costco', daysAgo: 42 },
    { account: checkingAccount.id, category: 'Housing', type: 'EXPENSE' as TransactionType, amount: 150000, desc: 'Monthly Rent', daysAgo: 31 },
    { account: creditCard.id, category: 'Entertainment', type: 'EXPENSE' as TransactionType, amount: 3500, desc: 'Movie Tickets', daysAgo: 38 },
    { account: creditCard.id, category: 'Healthcare', type: 'EXPENSE' as TransactionType, amount: 5000, desc: 'Pharmacy', daysAgo: 40 },

    // 2 months ago
    { account: checkingAccount.id, category: 'Salary', type: 'INCOME' as TransactionType, amount: 500000, desc: 'Monthly Salary', daysAgo: 62 },
    { account: checkingAccount.id, category: 'Investments', type: 'INCOME' as TransactionType, amount: 25000, desc: 'Dividend Payment', daysAgo: 65 },
    { account: creditCard.id, category: 'Groceries', type: 'EXPENSE' as TransactionType, amount: 11000, desc: 'Weekly Groceries', daysAgo: 68 },
    { account: checkingAccount.id, category: 'Housing', type: 'EXPENSE' as TransactionType, amount: 150000, desc: 'Monthly Rent', daysAgo: 61 },
    { account: creditCard.id, category: 'Education', type: 'EXPENSE' as TransactionType, amount: 29900, desc: 'Online Course', daysAgo: 70 },
  ];

  for (const tx of transactions) {
    const date = new Date(now);
    date.setDate(date.getDate() - tx.daysAgo);

    await prisma.transaction.create({
      data: {
        user_id: user.id,
        account_id: tx.account,
        category_id: getCategoryId(tx.category),
        type: tx.type,
        amount: tx.amount,
        description: tx.desc,
        date,
      },
    });
  }

  console.log(`Created ${transactions.length} transactions`);

  // Update cached balances
  for (const acct of [checkingAccount, savingsAccount, creditCard]) {
    const result = await prisma.transaction.groupBy({
      by: ['type'],
      where: { account_id: acct.id, deleted_at: null },
      _sum: { amount: true },
    });

    let balance = 0;
    for (const row of result) {
      if (row.type === 'INCOME') balance += row._sum.amount || 0;
      if (row.type === 'EXPENSE') balance -= row._sum.amount || 0;
    }

    await prisma.account.update({
      where: { id: acct.id },
      data: { balance },
    });
  }

  // Create budgets for current month
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgetData = [
    { category: 'Groceries', amount: 30000 },
    { category: 'Dining Out', amount: 20000 },
    { category: 'Entertainment', amount: 10000 },
    { category: 'Shopping', amount: 15000 },
    { category: 'Transportation', amount: 15000 },
  ];

  for (const b of budgetData) {
    await prisma.budget.create({
      data: {
        user_id: user.id,
        category_id: getCategoryId(b.category),
        amount: b.amount,
        month: currentMonth,
        year: currentYear,
      },
    });
  }

  console.log(`Created ${budgetData.length} budgets`);
  console.log('Seeding complete!');
  console.log('\nDemo credentials:');
  console.log('  Email: demo@example.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
