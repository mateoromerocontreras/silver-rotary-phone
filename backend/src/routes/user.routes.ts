import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { authGuard } from '../middleware/auth';
import { updateUserSchema, changePasswordSchema, pushTokenSchema } from '../validators/user';

const router = Router();

router.use(authGuard);

router.get('/me', userController.getProfile);
router.patch('/me', validate(updateUserSchema), userController.updateProfile);
router.patch('/me/password', validate(changePasswordSchema), userController.changePassword);
router.post('/me/push-token', validate(pushTokenSchema), userController.registerPushToken);

export default router;
