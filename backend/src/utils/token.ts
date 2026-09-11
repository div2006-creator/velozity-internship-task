import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(user: { id: string; email: string; role: string }): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN as any });
}

export async function createAndSaveRefreshToken(userId: string): Promise<string> {
  const token = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string };
}

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
