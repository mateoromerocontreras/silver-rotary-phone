import request from 'supertest';
import {
  app,
  prisma,
  cleanDatabase,
  createTestUserWithCategories,
  getAuthToken,
  authHeader,
} from './setup';

const API = '/api/v1';

let token: string;
let userId: string;
let accountId: string;
let expenseCategoryId: string;
let incomeCategoryId: string;

beforeEach(async () => {
  await cleanDatabase();

  const { user, expenseCategory, incomeCategory } = await createTestUserWithCategories();
  userId = user.id;
  token = getAuthToken(userId, user.email);
  expenseCategoryId = expenseCategory.id;
  incomeCategoryId = incomeCategory.id;

  const account = await prisma.account.create({
    data: {
      user_id: userId,
      name: 'Test Checking',
      type: 'CHECKING',
      balance: 0,
    },
  });
  accountId = account.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /transactions', () => {
  it('should create a transaction', async () => {
    const res = await request(app).post(`${API}/transactions`).set(authHeader(token)).send({
      account_id: accountId,
      category_id: expenseCategoryId,
      type: 'EXPENSE',
      amount: 2500,
      description: 'Coffee',
      date: new Date().toISOString(),
    });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(2500);
    expect(res.body.description).toBe('Coffee');
    expect(res.body.type).toBe('EXPENSE');
    expect(res.body.account).toBeDefined();
    expect(res.body.category).toBeDefined();
  });

  it('should update account balance after creating expense', async () => {
    await request(app).post(`${API}/transactions`).set(authHeader(token)).send({
      account_id: accountId,
      category_id: expenseCategoryId,
      type: 'EXPENSE',
      amount: 5000,
      description: 'Groceries',
      date: new Date().toISOString(),
    });

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    expect(account!.balance).toBe(-5000);
  });

  it('should update account balance after creating income', async () => {
    await request(app).post(`${API}/transactions`).set(authHeader(token)).send({
      account_id: accountId,
      category_id: incomeCategoryId,
      type: 'INCOME',
      amount: 100000,
      description: 'Salary',
      date: new Date().toISOString(),
    });

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    expect(account!.balance).toBe(100000);
  });

  it('should return 400 for invalid amount', async () => {
    const res = await request(app).post(`${API}/transactions`).set(authHeader(token)).send({
      account_id: accountId,
      category_id: expenseCategoryId,
      type: 'EXPENSE',
      amount: -100,
      description: 'Negative',
      date: new Date().toISOString(),
    });

    expect(res.status).toBe(400);
  });

  it('should return 404 for non-existent account', async () => {
    const res = await request(app).post(`${API}/transactions`).set(authHeader(token)).send({
      account_id: '00000000-0000-0000-0000-000000000000',
      category_id: expenseCategoryId,
      type: 'EXPENSE',
      amount: 1000,
      description: 'Test',
      date: new Date().toISOString(),
    });

    expect(res.status).toBe(404);
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).post(`${API}/transactions`).send({
      account_id: accountId,
      category_id: expenseCategoryId,
      type: 'EXPENSE',
      amount: 1000,
      description: 'Test',
      date: new Date().toISOString(),
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /transactions', () => {
  beforeEach(async () => {
    // Create several transactions
    const txData = [
      {
        type: 'INCOME' as const,
        amount: 500000,
        description: 'Salary',
        category_id: incomeCategoryId,
        daysAgo: 1,
      },
      {
        type: 'EXPENSE' as const,
        amount: 5000,
        description: 'Groceries',
        category_id: expenseCategoryId,
        daysAgo: 2,
      },
      {
        type: 'EXPENSE' as const,
        amount: 3000,
        description: 'Coffee Shop',
        category_id: expenseCategoryId,
        daysAgo: 3,
      },
      {
        type: 'EXPENSE' as const,
        amount: 15000,
        description: 'Restaurant Dinner',
        category_id: expenseCategoryId,
        daysAgo: 5,
      },
    ];

    for (const tx of txData) {
      const date = new Date();
      date.setDate(date.getDate() - tx.daysAgo);

      await prisma.transaction.create({
        data: {
          user_id: userId,
          account_id: accountId,
          category_id: tx.category_id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          date,
        },
      });
    }
  });

  it('should return paginated transactions', async () => {
    const res = await request(app)
      .get(`${API}/transactions`)
      .set(authHeader(token))
      .query({ page: 1, limit: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(4);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('should filter by type', async () => {
    const res = await request(app)
      .get(`${API}/transactions`)
      .set(authHeader(token))
      .query({ type: 'INCOME' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].type).toBe('INCOME');
  });

  it('should filter by category', async () => {
    const res = await request(app)
      .get(`${API}/transactions`)
      .set(authHeader(token))
      .query({ category_id: expenseCategoryId });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('should search by description', async () => {
    const res = await request(app)
      .get(`${API}/transactions`)
      .set(authHeader(token))
      .query({ search: 'Coffee' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].description).toBe('Coffee Shop');
  });

  it('should sort by amount ascending', async () => {
    const res = await request(app)
      .get(`${API}/transactions`)
      .set(authHeader(token))
      .query({ sort: 'amount', order: 'asc' });

    expect(res.status).toBe(200);
    const amounts = res.body.data.map((t: { amount: number }) => t.amount);
    expect(amounts).toEqual([...amounts].sort((a: number, b: number) => a - b));
  });
});

describe('GET /transactions/:id', () => {
  it('should return a single transaction', async () => {
    const tx = await prisma.transaction.create({
      data: {
        user_id: userId,
        account_id: accountId,
        category_id: expenseCategoryId,
        type: 'EXPENSE',
        amount: 1234,
        description: 'Test Transaction',
        date: new Date(),
      },
    });

    const res = await request(app).get(`${API}/transactions/${tx.id}`).set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(tx.id);
    expect(res.body.amount).toBe(1234);
  });

  it('should return 404 for non-existent transaction', async () => {
    const res = await request(app)
      .get(`${API}/transactions/00000000-0000-0000-0000-000000000000`)
      .set(authHeader(token));

    expect(res.status).toBe(404);
  });
});

describe('PATCH /transactions/:id', () => {
  it('should update a transaction', async () => {
    const tx = await prisma.transaction.create({
      data: {
        user_id: userId,
        account_id: accountId,
        category_id: expenseCategoryId,
        type: 'EXPENSE',
        amount: 1000,
        description: 'Original',
        date: new Date(),
      },
    });

    const res = await request(app)
      .patch(`${API}/transactions/${tx.id}`)
      .set(authHeader(token))
      .send({ amount: 2000, description: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(2000);
    expect(res.body.description).toBe('Updated');
  });

  it('should recalculate account balance after update', async () => {
    const tx = await prisma.transaction.create({
      data: {
        user_id: userId,
        account_id: accountId,
        category_id: expenseCategoryId,
        type: 'EXPENSE',
        amount: 1000,
        description: 'Original',
        date: new Date(),
      },
    });

    await request(app)
      .patch(`${API}/transactions/${tx.id}`)
      .set(authHeader(token))
      .send({ amount: 5000 });

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    expect(account!.balance).toBe(-5000);
  });
});

describe('DELETE /transactions/:id', () => {
  it('should soft delete a transaction', async () => {
    const tx = await prisma.transaction.create({
      data: {
        user_id: userId,
        account_id: accountId,
        category_id: expenseCategoryId,
        type: 'EXPENSE',
        amount: 3000,
        description: 'To Delete',
        date: new Date(),
      },
    });

    const res = await request(app).delete(`${API}/transactions/${tx.id}`).set(authHeader(token));

    expect(res.status).toBe(204);

    const deleted = await prisma.transaction.findUnique({ where: { id: tx.id } });
    expect(deleted!.deleted_at).not.toBeNull();
  });

  it('should recalculate balance after deletion', async () => {
    // Create income then expense
    await prisma.transaction.create({
      data: {
        user_id: userId,
        account_id: accountId,
        category_id: incomeCategoryId,
        type: 'INCOME',
        amount: 10000,
        description: 'Income',
        date: new Date(),
      },
    });

    const expenseTx = await prisma.transaction.create({
      data: {
        user_id: userId,
        account_id: accountId,
        category_id: expenseCategoryId,
        type: 'EXPENSE',
        amount: 3000,
        description: 'Expense',
        date: new Date(),
      },
    });

    // Update cached balance first
    await request(app).delete(`${API}/transactions/${expenseTx.id}`).set(authHeader(token));

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    expect(account!.balance).toBe(10000); // Only income remains
  });

  it('should not return soft-deleted transactions in list', async () => {
    const tx = await prisma.transaction.create({
      data: {
        user_id: userId,
        account_id: accountId,
        category_id: expenseCategoryId,
        type: 'EXPENSE',
        amount: 1000,
        description: 'Deleted',
        date: new Date(),
      },
    });

    await request(app).delete(`${API}/transactions/${tx.id}`).set(authHeader(token));

    const res = await request(app).get(`${API}/transactions`).set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});
