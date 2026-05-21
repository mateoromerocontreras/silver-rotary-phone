import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../types';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;

    if (!token) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required' },
      });
      return;
    }

    const result = await authService.refresh(token);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (token) {
      await authService.logout(token);
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}
