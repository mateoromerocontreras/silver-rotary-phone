import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller';
import { validate } from '../middleware/validate';
import { authGuard } from '../middleware/auth';
import { createBudgetSchema, updateBudgetSchema, budgetQuerySchema } from '../validators/budget';

const router = Router();

router.use(authGuard);

router.get('/', validate(budgetQuerySchema, 'query'), budgetController.listBudgets);
router.post('/', validate(createBudgetSchema), budgetController.createBudget);
router.get('/:id', budgetController.getBudget);
router.patch('/:id', validate(updateBudgetSchema), budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

export default router;
