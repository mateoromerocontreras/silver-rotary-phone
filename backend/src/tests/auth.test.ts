import request from 'supertest';
import { app, prisma, cleanDatabase, createTestUser, authHeader } from './setup';

const API = '/api/v1';

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /auth/register', () => {
  it('should register a new user and return tokens', async () => {
    const res = await request(app).post(`${API}/auth/register`).send({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('newuser@example.com');
    expect(res.body.user.name).toBe('New User');
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('should seed default categories on registration', async () => {
    const res = await request(app).post(`${API}/auth/register`).send({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    });

    expect(res.status).toBe(201);

    const categories = await prisma.category.findMany({
      where: { user_id: res.body.user.id },
    });

    expect(categories.length).toBe(18); // 12 expense + 6 income
  });

  it('should return 409 if email already exists', async () => {
    await createTestUser({ email: 'existing@example.com' });

    const res = await request(app).post(`${API}/auth/register`).send({
      email: 'existing@example.com',
      password: 'password123',
      name: 'Another User',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app).post(`${API}/auth/register`).send({
      email: 'not-an-email',
      password: 'password123',
      name: 'Test',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for short password', async () => {
    const res = await request(app).post(`${API}/auth/register`).send({
      email: 'test@example.com',
      password: 'short',
      name: 'Test',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await createTestUser({ email: 'login@example.com' });
  });

  it('should login with valid credentials', async () => {
    const res = await request(app).post(`${API}/auth/login`).send({
      email: 'login@example.com',
      password: 'testpassword123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('login@example.com');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app).post(`${API}/auth/login`).send({
      email: 'login@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app).post(`${API}/auth/login`).send({
      email: 'nonexistent@example.com',
      password: 'testpassword123',
    });

    expect(res.status).toBe(401);
  });
});

describe('POST /auth/refresh', () => {
  it('should refresh tokens with valid refresh token', async () => {
    const registerRes = await request(app).post(`${API}/auth/register`).send({
      email: 'refresh@example.com',
      password: 'password123',
      name: 'Refresh User',
    });

    const res = await request(app).post(`${API}/auth/refresh`).send({
      refreshToken: registerRes.body.refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    // New refresh token should be different (rotation)
    expect(res.body.refreshToken).not.toBe(registerRes.body.refreshToken);
  });

  it('should return 401 for invalid refresh token', async () => {
    const res = await request(app).post(`${API}/auth/refresh`).send({
      refreshToken: 'invalid-token',
    });

    expect(res.status).toBe(401);
  });

  it('should return 400 when no refresh token provided', async () => {
    const res = await request(app).post(`${API}/auth/refresh`).send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/logout', () => {
  it('should logout and invalidate refresh token', async () => {
    const registerRes = await request(app).post(`${API}/auth/register`).send({
      email: 'logout@example.com',
      password: 'password123',
      name: 'Logout User',
    });

    const token = registerRes.body.accessToken;

    const res = await request(app)
      .post(`${API}/auth/logout`)
      .set(authHeader(token))
      .send({ refreshToken: registerRes.body.refreshToken });

    expect(res.status).toBe(200);

    // Refresh with old token should fail
    const refreshRes = await request(app).post(`${API}/auth/refresh`).send({
      refreshToken: registerRes.body.refreshToken,
    });

    expect(refreshRes.status).toBe(401);
  });

  it('should return 401 without auth header', async () => {
    const res = await request(app).post(`${API}/auth/logout`).send({});

    expect(res.status).toBe(401);
  });
});
