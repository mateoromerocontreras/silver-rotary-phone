import { Router } from 'express';
import * as accountController from '../controllers/account.controller';
import { validate } from '../middleware/validate';
import { authGuard } from '../middleware/auth';
import { createAccountSchema, updateAccountSchema } from '../validators/account';

const router = Router();

router.use(authGuard);

router.get('/', accountController.listAccounts);
router.post('/', validate(createAccountSchema), accountController.createAccount);
router.get('/:id', accountController.getAccount);
router.patch('/:id', validate(updateAccountSchema), accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

export default router;
