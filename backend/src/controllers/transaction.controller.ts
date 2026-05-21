import { Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service';
import { AuthRequest } from '../types';

export async function listTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await transactionService.listTransactions(req.user!.userId, req.query as never);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transaction = await transactionService.createTransaction(req.user!.userId, req.body);
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
}

export async function getTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transaction = await transactionService.getTransaction(
      req.user!.userId,
      req.params.id as string,
    );
    res.json(transaction);
  } catch (err) {
    next(err);
  }
}

export async function updateTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transaction = await transactionService.updateTransaction(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );
    res.json(transaction);
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await transactionService.deleteTransaction(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
