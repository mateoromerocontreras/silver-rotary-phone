import { Response, NextFunction } from 'express';
import * as accountService from '../services/account.service';
import { AuthRequest } from '../types';

export async function listAccounts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const accounts = await accountService.listAccounts(req.user!.userId);
    res.json(accounts);
  } catch (err) {
    next(err);
  }
}

export async function createAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const account = await accountService.createAccount(req.user!.userId, req.body);
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
}

export async function getAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const account = await accountService.getAccount(req.user!.userId, req.params.id as string);
    res.json(account);
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const account = await accountService.updateAccount(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );
    res.json(account);
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await accountService.deleteAccount(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
