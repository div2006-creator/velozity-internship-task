import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { pushToUser } from '../websocket';

const prisma = new PrismaClient();

/**
 * GET /api/notifications
 * Retrieves user notifications and unread count.
 */
export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;

    const notifications = await prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });

    res.status(200).json({
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marks a notification as read and pushes UNREAD_COUNT_CHANGED via WebSocket.
 */
export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.userId },
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });

    // Push updated unread count to user's WebSocket channel
    pushToUser(user.userId, 'UNREAD_COUNT_CHANGED', {
      unreadCount,
      notificationId: id,
      action: 'MARKED_READ',
    });

    res.status(200).json({
      message: 'Notification marked as read',
      notification: updatedNotification,
      unreadCount,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications for user as read and pushes unreadCount: 0 via WebSocket.
 */
export async function markAllNotificationsAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;

    await prisma.notification.updateMany({
      where: { userId: user.userId, isRead: false },
      data: { isRead: true },
    });

    // Push updated unread count (0) via WebSocket
    pushToUser(user.userId, 'UNREAD_COUNT_CHANGED', {
      unreadCount: 0,
      action: 'READ_ALL',
    });

    res.status(200).json({
      message: 'All notifications marked as read',
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
}
