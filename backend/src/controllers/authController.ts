import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  createAndSaveRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/token';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Helper to sanitize user output (exclude passwordHash)
function sanitizeUser(user: any) {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * POST /auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    
    // Validate role if passed
    let userRole: Role = Role.CLIENT;
    if (role && Object.values(Role).includes(role as Role)) {
      userRole = role as Role;
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        role: userRole,
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = await createAndSaveRefreshToken(user.id);

    setRefreshTokenCookie(res, refreshToken);

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'USER_REGISTERED',
        details: `User ${user.email} registered with role ${user.role}`,
        userId: user.id,
      },
    });

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
}

/**
 * POST /auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await createAndSaveRefreshToken(user.id);

    setRefreshTokenCookie(res, refreshToken);

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        action: 'USER_LOGIN',
        details: `User ${user.email} logged in`,
        userId: user.id,
      },
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
}

/**
 * POST /auth/refresh
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshTokenCookie = req.cookies?.refreshToken;

    if (!refreshTokenCookie) {
      res.status(401).json({ error: 'Refresh token cookie missing' });
      return;
    }

    // Verify token signature
    let decoded: { userId: string };
    try {
      decoded = verifyRefreshToken(refreshTokenCookie);
    } catch (err) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Check token in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenCookie },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ error: 'Refresh token is revoked or expired' });
      return;
    }

    // Revoke old token and issue new refresh token (Rotation pattern)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const newAccessToken = generateAccessToken(storedToken.user);
    const newRefreshToken = await createAndSaveRefreshToken(storedToken.user.id);

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error during token refresh' });
  }
}

/**
 * POST /auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshTokenCookie = req.cookies?.refreshToken;

    if (refreshTokenCookie) {
      // Revoke in database if exists
      await prisma.refreshToken.updateMany({
        where: { token: refreshTokenCookie },
        data: { isRevoked: true },
      });
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    clearRefreshTokenCookie(res);
    res.status(200).json({ message: 'Logged out successfully' });
  }
}

/**
 * GET /auth/me
 */
export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error fetching user profile' });
  }
}
