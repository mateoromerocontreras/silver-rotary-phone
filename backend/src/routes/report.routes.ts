import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { validate } from '../middleware/validate';
import { authGuard } from '../middleware/auth';
import { monthYearQuerySchema, monthsQuerySchema } from '../validators/report';

const router = Router();

router.use(authGuard);

router.get('/summary', validate(monthYearQuerySchema, 'query'), reportController.getSummary);
router.get(
  '/spending-by-category',
  validate(monthYearQuerySchema, 'query'),
  reportController.getSpendingByCategory,
);
router.get(
  '/income-vs-expense',
  validate(monthsQuerySchema, 'query'),
  reportController.getIncomeVsExpense,
);
router.get(
  '/balance-trend',
  validate(monthsQuerySchema, 'query'),
  reportController.getBalanceTrend,
);

export default router;
