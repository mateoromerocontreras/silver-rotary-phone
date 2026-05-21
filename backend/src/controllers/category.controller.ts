import { Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import { AuthRequest } from '../types';

export async function listCategories(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const type = req.query.type as string | undefined;
    const categories = await categoryService.listCategories(req.user!.userId, type);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.createCategory(req.user!.userId, req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.updateCategory(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await categoryService.deleteCategory(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
