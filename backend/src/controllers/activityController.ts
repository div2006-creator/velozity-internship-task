import { Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * GET /api/activity-logs
 * Returns stored activity logs with explicit user, task, old status, new status, and timestamp.
 */
export async function getActivityLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;

    if (user.role === Role.DEVELOPER) {
      res.status(403).json({ error: 'Forbidden: Developers do not have access to activity logs' });
      return;
    }

    let whereClause = {};

    if (user.role === Role.PROJECT_MANAGER) {
      whereClause = {
        OR: [
          { userId: user.userId },
          { project: { ownerId: user.userId } },
          { task: { project: { ownerId: user.userId } } },
        ],
      };
    }

    const rawLogs = await prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const activityLogs = rawLogs.map(log => {
      let parsedDetails: any = null;
      try {
        if (log.details) {
          parsedDetails = JSON.parse(log.details);
        }
      } catch (err) {
        parsedDetails = { message: log.details };
      }

      return {
        id: log.id,
        action: log.action,
        timestamp: log.createdAt,
        user: log.user,
        project: log.project,
        task: log.task,
        oldStatus: parsedDetails?.oldStatus || null,
        newStatus: parsedDetails?.newStatus || null,
        formattedMessage: parsedDetails?.formattedMessage || parsedDetails?.message || null,
        details: parsedDetails,
      };
    });

    res.status(200).json({
      count: activityLogs.length,
      activityLogs,
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
}

/**
 * GET /api/activity-logs/recent
 * Returns the last 20 activity logs directly from PostgreSQL database (No in-memory cache).
 * Query parameters: ?limit=20&projectId=...
 */
export async function getRecentActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { limit = '20', projectId } = req.query;

    if (user.role === Role.DEVELOPER) {
      res.status(403).json({ error: 'Forbidden: Developers do not have access to activity logs' });
      return;
    }

    const limitNumber = Math.min(parseInt(limit as string, 10) || 20, 50);

    const whereClause: any = {};
    if (projectId && typeof projectId === 'string') {
      whereClause.projectId = projectId;
    }

    if (user.role === Role.PROJECT_MANAGER) {
      whereClause.OR = [
        { userId: user.userId },
        { project: { ownerId: user.userId } },
        { task: { project: { ownerId: user.userId } } },
      ];
    }

    // DIRECT DATABASE QUERY - No in-memory cache
    const rawLogs = await prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNumber,
    });

    const activities = rawLogs.map(log => {
      let parsedDetails: any = null;
      try {
        if (log.details) {
          parsedDetails = JSON.parse(log.details);
        }
      } catch (err) {
        parsedDetails = { message: log.details };
      }

      return {
        id: log.id,
        action: log.action,
        timestamp: log.createdAt,
        user: log.user,
        project: log.project,
        task: log.task,
        oldStatus: parsedDetails?.oldStatus || null,
        newStatus: parsedDetails?.newStatus || null,
        formattedMessage: parsedDetails?.formattedMessage || parsedDetails?.message || null,
        details: parsedDetails,
      };
    });

    res.status(200).json({
      count: activities.length,
      limit: limitNumber,
      projectId: projectId || null,
      activities,
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities from database' });
  }
}
