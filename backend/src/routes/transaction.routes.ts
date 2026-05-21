import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { validate } from '../middleware/validate';
import { authGuard } from '../middleware/auth';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from '../validators/transaction';

const router = Router();

router.use(authGuard);

router.get('/', validate(transactionQuerySchema, 'query'), transactionController.listTransactions);
router.post('/', validate(createTransactionSchema), transactionController.createTransaction);
router.get('/:id', transactionController.getTransaction);
router.patch('/:id', validate(updateTransactionSchema), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
