import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { authGuard } from '../middleware/auth';
import { createCategorySchema, updateCategorySchema } from '../validators/category';

const router = Router();

router.use(authGuard);

router.get('/', categoryController.listCategories);
router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
