import {
  mockUser, mockAccounts, mockCategories, mockTransactions,
  mockBudgets, mockSummary, mockSpendingByCategory, mockIncomeVsExpense,
} from './mockData';
import type {
  User, Account, Category, Transaction, Budget,
  ReportSummary, SpendingByCategory, IncomeVsExpense,
  AuthTokens, PaginatedResponse,
} from '@/src/types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const api = {
  auth: {
    async login(_email: string, _password: string): Promise<{ user: User; tokens: AuthTokens }> {
      await delay(800);
      return {
        user: mockUser,
        tokens: { accessToken: 'mock-access', refreshToken: 'mock-refresh' },
      };
    },
    async register(_email: string, _password: string, _name: string): Promise<{ user: User; tokens: AuthTokens }> {
      await delay(800);
      return {
        user: { ...mockUser, name: _name, email: _email },
        tokens: { accessToken: 'mock-access', refreshToken: 'mock-refresh' },
      };
    },
  },
  accounts: {
    async list(): Promise<Account[]> {
      await delay(300);
      return mockAccounts;
    },
    async get(id: string): Promise<Account | undefined> {
      await delay(200);
      return mockAccounts.find((a) => a.id === id);
    },
  },
  categories: {
    async list(): Promise<Category[]> {
      await delay(200);
      return mockCategories;
    },
  },
  transactions: {
    async list(page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> {
      await delay(400);
      const start = (page - 1) * limit;
      const data = mockTransactions.slice(start, start + limit);
      return {
        data,
        pagination: {
          page,
          limit,
          total: mockTransactions.length,
          totalPages: Math.ceil(mockTransactions.length / limit),
        },
      };
    },
    async get(id: string): Promise<Transaction | undefined> {
      await delay(200);
      return mockTransactions.find((t) => t.id === id);
    },
  },
  budgets: {
    async list(): Promise<Budget[]> {
      await delay(300);
      return mockBudgets;
    },
  },
  reports: {
    async summary(): Promise<ReportSummary> {
      await delay(300);
      return mockSummary;
    },
    async spendingByCategory(): Promise<SpendingByCategory[]> {
      await delay(300);
      return mockSpendingByCategory;
    },
    async incomeVsExpense(): Promise<IncomeVsExpense[]> {
      await delay(300);
      return mockIncomeVsExpense;
    },
  },
};
