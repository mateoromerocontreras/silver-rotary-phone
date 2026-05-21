import { PrismaClient } from '@prisma/client';
import { env } from '../utils/env';

const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;
