import type {
  User, Account, Category, Transaction, Budget,
  ReportSummary, SpendingByCategory, IncomeVsExpense,
} from '@/src/types';

export const mockUser: User = {
  id: 'u1',
  email: 'mateo@example.com',
  name: 'Mateo',
  currency: 'USD',
  avatar_url: null,
  created_at: '2024-01-15T10:00:00Z',
};

export const mockAccounts: Account[] = [
  {
    id: 'acc1', user_id: 'u1', name: 'Main Checking', type: 'CHECKING',
    balance: 842350, institution: 'Chase', color: '#007AFF', icon: 'card',
    is_active: true, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'acc2', user_id: 'u1', name: 'Savings', type: 'SAVINGS',
    balance: 2156000, institution: 'Ally Bank', color: '#34C759', icon: 'wallet',
    is_active: true, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'acc3', user_id: 'u1', name: 'Credit Card', type: 'CREDIT_CARD',
    balance: -128450, institution: 'Amex', color: '#FF9500', icon: 'card',
    is_active: true, created_at: '2024-02-01T10:00:00Z', updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'acc4', user_id: 'u1', name: 'Cash', type: 'CASH',
    balance: 34500, institution: null, color: '#8E8E93', icon: 'cash',
    is_active: true, created_at: '2024-03-01T10:00:00Z', updated_at: '2024-06-01T10:00:00Z',
  },
];

export const mockCategories: Category[] = [
  { id: 'cat1', user_id: 'u1', name: 'Salary', type: 'INCOME', icon: 'briefcase', color: '#34C759', is_default: true, created_at: '2024-01-15' },
  { id: 'cat2', user_id: 'u1', name: 'Freelance', type: 'INCOME', icon: 'code-slash', color: '#30D158', is_default: true, created_at: '2024-01-15' },
  { id: 'cat3', user_id: 'u1', name: 'Groceries', type: 'EXPENSE', icon: 'cart', color: '#FF6B6B', is_default: true, created_at: '2024-01-15' },
  { id: 'cat4', user_id: 'u1', name: 'Dining', type: 'EXPENSE', icon: 'restaurant', color: '#FF9500', is_default: true, created_at: '2024-01-15' },
  { id: 'cat5', user_id: 'u1', name: 'Transport', type: 'EXPENSE', icon: 'car', color: '#007AFF', is_default: true, created_at: '2024-01-15' },
  { id: 'cat6', user_id: 'u1', name: 'Entertainment', type: 'EXPENSE', icon: 'game-controller', color: '#AF52DE', is_default: true, created_at: '2024-01-15' },
  { id: 'cat7', user_id: 'u1', name: 'Shopping', type: 'EXPENSE', icon: 'bag', color: '#FF2D55', is_default: true, created_at: '2024-01-15' },
  { id: 'cat8', user_id: 'u1', name: 'Utilities', type: 'EXPENSE', icon: 'flash', color: '#FFCC00', is_default: true, created_at: '2024-01-15' },
  { id: 'cat9', user_id: 'u1', name: 'Healthcare', type: 'EXPENSE', icon: 'medkit', color: '#FF3B30', is_default: true, created_at: '2024-01-15' },
  { id: 'cat10', user_id: 'u1', name: 'Subscriptions', type: 'EXPENSE', icon: 'repeat', color: '#5856D6', is_default: true, created_at: '2024-01-15' },
  { id: 'cat11', user_id: 'u1', name: 'Investments', type: 'INCOME', icon: 'trending-up', color: '#00C7BE', is_default: true, created_at: '2024-01-15' },
  { id: 'cat12', user_id: 'u1', name: 'Housing', type: 'EXPENSE', icon: 'home', color: '#64748B', is_default: true, created_at: '2024-01-15' },
];

const now = new Date();
const thisMonth = now.getMonth();
const thisYear = now.getFullYear();

function d(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export const mockTransactions: Transaction[] = [
  { id: 't1', user_id: 'u1', account_id: 'acc1', category_id: 'cat1', type: 'INCOME', amount: 520000, description: 'Monthly Salary', notes: null, date: d(1), created_at: d(1), category: mockCategories[0], account: mockAccounts[0] },
  { id: 't2', user_id: 'u1', account_id: 'acc3', category_id: 'cat3', type: 'EXPENSE', amount: 8542, description: 'Whole Foods Market', notes: 'Weekly groceries', date: d(1), created_at: d(1), category: mockCategories[2], account: mockAccounts[2] },
  { id: 't3', user_id: 'u1', account_id: 'acc3', category_id: 'cat4', type: 'EXPENSE', amount: 4250, description: 'Chipotle', notes: null, date: d(2), created_at: d(2), category: mockCategories[3], account: mockAccounts[2] },
  { id: 't4', user_id: 'u1', account_id: 'acc1', category_id: 'cat5', type: 'EXPENSE', amount: 5500, description: 'Uber ride', notes: 'Airport pickup', date: d(2), created_at: d(2), category: mockCategories[4], account: mockAccounts[0] },
  { id: 't5', user_id: 'u1', account_id: 'acc3', category_id: 'cat10', type: 'EXPENSE', amount: 1599, description: 'Netflix', notes: null, date: d(3), created_at: d(3), category: mockCategories[9], account: mockAccounts[2] },
  { id: 't6', user_id: 'u1', account_id: 'acc3', category_id: 'cat6', type: 'EXPENSE', amount: 2400, description: 'Movie tickets', notes: null, date: d(4), created_at: d(4), category: mockCategories[5], account: mockAccounts[2] },
  { id: 't7', user_id: 'u1', account_id: 'acc1', category_id: 'cat2', type: 'INCOME', amount: 150000, description: 'Web dev project', notes: 'Client: Acme Corp', date: d(5), created_at: d(5), category: mockCategories[1], account: mockAccounts[0] },
  { id: 't8', user_id: 'u1', account_id: 'acc3', category_id: 'cat7', type: 'EXPENSE', amount: 12999, description: 'Amazon', notes: 'New headphones', date: d(5), created_at: d(5), category: mockCategories[6], account: mockAccounts[2] },
  { id: 't9', user_id: 'u1', account_id: 'acc1', category_id: 'cat8', type: 'EXPENSE', amount: 15400, description: 'Electric bill', notes: null, date: d(7), created_at: d(7), category: mockCategories[7], account: mockAccounts[0] },
  { id: 't10', user_id: 'u1', account_id: 'acc1', category_id: 'cat12', type: 'EXPENSE', amount: 195000, description: 'Rent', notes: 'May rent', date: d(10), created_at: d(10), category: mockCategories[11], account: mockAccounts[0] },
  { id: 't11', user_id: 'u1', account_id: 'acc3', category_id: 'cat3', type: 'EXPENSE', amount: 6235, description: 'Trader Joe\'s', notes: null, date: d(12), created_at: d(12), category: mockCategories[2], account: mockAccounts[2] },
  { id: 't12', user_id: 'u1', account_id: 'acc3', category_id: 'cat4', type: 'EXPENSE', amount: 3800, description: 'Starbucks', notes: null, date: d(13), created_at: d(13), category: mockCategories[3], account: mockAccounts[2] },
  { id: 't13', user_id: 'u1', account_id: 'acc1', category_id: 'cat9', type: 'EXPENSE', amount: 25000, description: 'Doctor visit', notes: 'Annual checkup', date: d(15), created_at: d(15), category: mockCategories[8], account: mockAccounts[0] },
  { id: 't14', user_id: 'u1', account_id: 'acc3', category_id: 'cat10', type: 'EXPENSE', amount: 999, description: 'Spotify', notes: null, date: d(18), created_at: d(18), category: mockCategories[9], account: mockAccounts[2] },
  { id: 't15', user_id: 'u1', account_id: 'acc1', category_id: 'cat11', type: 'INCOME', amount: 32000, description: 'Dividend income', notes: 'Q2 dividends', date: d(20), created_at: d(20), category: mockCategories[10], account: mockAccounts[0] },
];

export const mockBudgets: Budget[] = [
  { id: 'b1', user_id: 'u1', category_id: 'cat3', amount: 40000, spent: 14777, remaining: 25223, percentage: 36.9, month: thisMonth + 1, year: thisYear, category: mockCategories[2], created_at: '2024-05-01' },
  { id: 'b2', user_id: 'u1', category_id: 'cat4', amount: 25000, spent: 8050, remaining: 16950, percentage: 32.2, month: thisMonth + 1, year: thisYear, category: mockCategories[3], created_at: '2024-05-01' },
  { id: 'b3', user_id: 'u1', category_id: 'cat6', amount: 15000, spent: 2400, remaining: 12600, percentage: 16.0, month: thisMonth + 1, year: thisYear, category: mockCategories[5], created_at: '2024-05-01' },
  { id: 'b4', user_id: 'u1', category_id: 'cat7', amount: 20000, spent: 12999, remaining: 7001, percentage: 65.0, month: thisMonth + 1, year: thisYear, category: mockCategories[6], created_at: '2024-05-01' },
  { id: 'b5', user_id: 'u1', category_id: 'cat12', amount: 200000, spent: 195000, remaining: 5000, percentage: 97.5, month: thisMonth + 1, year: thisYear, category: mockCategories[11], created_at: '2024-05-01' },
  { id: 'b6', user_id: 'u1', category_id: 'cat10', amount: 5000, spent: 2598, remaining: 2402, percentage: 52.0, month: thisMonth + 1, year: thisYear, category: mockCategories[9], created_at: '2024-05-01' },
];

export const mockSummary: ReportSummary = {
  totalIncome: 702000,
  totalExpense: 281724,
  netSavings: 420276,
  savingsRate: 59.9,
};

export const mockSpendingByCategory: SpendingByCategory[] = [
  { category: mockCategories[11], amount: 195000, percentage: 69.2 },
  { category: mockCategories[2], amount: 14777, percentage: 5.2 },
  { category: mockCategories[6], amount: 12999, percentage: 4.6 },
  { category: mockCategories[8], amount: 25000, percentage: 8.9 },
  { category: mockCategories[7], amount: 15400, percentage: 5.5 },
  { category: mockCategories[3], amount: 8050, percentage: 2.9 },
  { category: mockCategories[4], amount: 5500, percentage: 2.0 },
  { category: mockCategories[9], amount: 2598, percentage: 0.9 },
  { category: mockCategories[5], amount: 2400, percentage: 0.8 },
];

export const mockIncomeVsExpense: IncomeVsExpense[] = [
  { month: 12, year: 2025, income: 580000, expense: 342000 },
  { month: 1, year: 2026, income: 520000, expense: 298000 },
  { month: 2, year: 2026, income: 670000, expense: 315000 },
  { month: 3, year: 2026, income: 520000, expense: 287000 },
  { month: 4, year: 2026, income: 545000, expense: 321000 },
  { month: 5, year: 2026, income: 702000, expense: 281724 },
];
