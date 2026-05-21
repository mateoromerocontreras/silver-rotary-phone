import { Response, NextFunction } from 'express';
import * as budgetService from '../services/budget.service';
import { AuthRequest } from '../types';

export async function listBudgets(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const budgets = await budgetService.listBudgets(req.user!.userId, month, year);
    res.json(budgets);
  } catch (err) {
    next(err);
  }
}

export async function createBudget(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const budget = await budgetService.createBudget(req.user!.userId, req.body);
    res.status(201).json(budget);
  } catch (err) {
    next(err);
  }
}

export async function getBudget(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const budget = await budgetService.getBudget(req.user!.userId, req.params.id as string);
    res.json(budget);
  } catch (err) {
    next(err);
  }
}

export async function updateBudget(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const budget = await budgetService.updateBudget(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );
    res.json(budget);
  } catch (err) {
    next(err);
  }
}

export async function deleteBudget(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await budgetService.deleteBudget(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
