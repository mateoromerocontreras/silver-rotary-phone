import prisma from '../prisma/client';

export async function getMonthlySummary(userId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const result = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      user_id: userId,
      deleted_at: null,
      date: { gte: startDate, lt: endDate },
    },
    _sum: { amount: true },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  for (const row of result) {
    if (row.type === 'INCOME') totalIncome = row._sum.amount || 0;
    if (row.type === 'EXPENSE') totalExpense = row._sum.amount || 0;
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 1000) / 10 : 0;

  return { totalIncome, totalExpense, netSavings, savingsRate };
}

export async function getSpendingByCategory(userId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const result = await prisma.transaction.groupBy({
    by: ['category_id'],
    where: {
      user_id: userId,
      type: 'EXPENSE',
      deleted_at: null,
      date: { gte: startDate, lt: endDate },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const totalExpense = result.reduce((sum, row) => sum + (row._sum.amount || 0), 0);

  const categoryIds = result.map((r) => r.category_id);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true, color: true },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return result.map((row) => {
    const amount = row._sum.amount || 0;
    const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 1000) / 10 : 0;

    return {
      category: categoryMap.get(row.category_id) || {
        id: row.category_id,
        name: 'Unknown',
        icon: 'help-circle',
        color: '#999',
      },
      amount,
      percentage,
    };
  });
}

export async function getIncomeVsExpense(userId: string, months: number) {
  const now = new Date();
  const results = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const grouped = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        user_id: userId,
        deleted_at: null,
        date: { gte: startDate, lt: endDate },
      },
      _sum: { amount: true },
    });

    let income = 0;
    let expense = 0;

    for (const row of grouped) {
      if (row.type === 'INCOME') income = row._sum.amount || 0;
      if (row.type === 'EXPENSE') expense = row._sum.amount || 0;
    }

    results.push({ month, year, income, expense });
  }

  return results;
}

export async function getBalanceTrend(userId: string, months: number) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: userId,
      deleted_at: null,
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
    select: { date: true, type: true, amount: true },
  });

  // Get balance before the period starts
  const priorTransactions = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      user_id: userId,
      deleted_at: null,
      date: { lt: startDate },
    },
    _sum: { amount: true },
  });

  let runningBalance = 0;
  for (const row of priorTransactions) {
    if (row.type === 'INCOME') runningBalance += row._sum.amount || 0;
    if (row.type === 'EXPENSE') runningBalance -= row._sum.amount || 0;
  }

  // Group transactions by day
  const dailyMap = new Map<string, number>();

  for (const tx of transactions) {
    const dateKey = tx.date.toISOString().split('T')[0];
    const delta = tx.type === 'INCOME' ? tx.amount : tx.type === 'EXPENSE' ? -tx.amount : 0;
    dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + delta);
  }

  // Build trend
  const trend: { date: string; balance: number }[] = [];
  const sortedDates = Array.from(dailyMap.keys()).sort();

  for (const date of sortedDates) {
    runningBalance += dailyMap.get(date) || 0;
    trend.push({ date, balance: runningBalance });
  }

  return trend;
}
