import { Response, NextFunction } from 'express';
import * as reportService from '../services/report.service';
import { AuthRequest } from '../types';

export async function getSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    const summary = await reportService.getMonthlySummary(req.user!.userId, month, year);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

export async function getSpendingByCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    const data = await reportService.getSpendingByCategory(req.user!.userId, month, year);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getIncomeVsExpense(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const months = Number(req.query.months) || 6;
    const data = await reportService.getIncomeVsExpense(req.user!.userId, months);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getBalanceTrend(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const months = Number(req.query.months) || 6;
    const data = await reportService.getBalanceTrend(req.user!.userId, months);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
