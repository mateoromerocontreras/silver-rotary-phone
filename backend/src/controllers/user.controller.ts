import { Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { AuthRequest } from '../types';

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.getProfile(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await userService.changePassword(req.user!.userId, req.body);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function registerPushToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pushToken = await userService.registerPushToken(req.user!.userId, req.body);
    res.status(201).json(pushToken);
  } catch (err) {
    next(err);
  }
}
