import cron from 'node-cron';
import { PrismaClient, TaskStatus } from '@prisma/client';
import { broadcastToRoom, pushToUser } from '../websocket';

const prisma = new PrismaClient();

/**
 * Core background worker function that queries PostgreSQL database for overdue tasks.
 * Detects tasks where dueDate < now AND status NOT IN ['COMPLETED', 'OVERDUE'].
 * Executed strictly by the background cron worker, NOT on dashboard page load.
 */
export async function checkOverdueTasksNow(): Promise<{ count: number; overdueTaskIds: string[] }> {
  try {
    const now = new Date();

    // DIRECT DATABASE QUERY - Find all tasks past due date that are not COMPLETED or OVERDUE
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { notIn: [TaskStatus.COMPLETED, TaskStatus.OVERDUE] },
      },
      include: {
        project: { select: { id: true, name: true, ownerId: true } },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
      },
    });

    if (overdueTasks.length === 0) {
      return { count: 0, overdueTaskIds: [] };
    }

    console.log(`⏰ Background Scheduler: Found ${overdueTasks.length} overdue task(s) to process.`);
    const processedIds: string[] = [];

    for (const task of overdueTasks) {
      const oldStatus = task.status;

      // 1. Update task status in PostgreSQL to OVERDUE
      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: { status: TaskStatus.OVERDUE },
      });

      processedIds.push(task.id);
      const timestamp = new Date();
      const formattedText = `Task '${task.title}' in project '${task.project.name}' was automatically marked OVERDUE by background scheduler`;

      // 2. Log ActivityLog in PostgreSQL
      const activityLog = await prisma.activityLog.create({
        data: {
          action: 'TASK_MARKED_OVERDUE',
          details: JSON.stringify({
            event: 'TASK_MARKED_OVERDUE',
            formattedMessage: formattedText,
            task: { id: task.id, title: task.title, projectId: task.projectId },
            oldStatus,
            newStatus: TaskStatus.OVERDUE,
            timestamp: timestamp.toISOString(),
          }),
          projectId: task.projectId,
          taskId: task.id,
          createdAt: timestamp,
        },
      });

      // 3. Broadcast real-time WebSocket event to project room "project:{projectId}"
      broadcastToRoom(`project:${task.projectId}`, 'TASK_STATUS_CHANGED', {
        formattedMessage: formattedText,
        task: { id: task.id, title: task.title, projectId: task.projectId },
        oldStatus,
        newStatus: TaskStatus.OVERDUE,
        timestamp: timestamp.toISOString(),
        activityLogId: activityLog.id,
      });

      // 4. Create DB Notification for assigned Developer & PM
      if (task.assignedDeveloperId) {
        const devNotif = await prisma.notification.create({
          data: {
            title: 'Task Overdue Warning',
            message: `Task '${task.title}' is overdue! Please update its status or check due dates.`,
            type: 'DUE_DATE_WARNING',
            userId: task.assignedDeveloperId,
          },
        });

        const devUnreadCount = await prisma.notification.count({
          where: { userId: task.assignedDeveloperId, isRead: false },
        });

        pushToUser(task.assignedDeveloperId, 'UNREAD_COUNT_CHANGED', {
          unreadCount: devUnreadCount,
          notification: devNotif,
        });
      }

      // Notify PM if different from developer
      if (task.project.ownerId !== task.assignedDeveloperId) {
        const pmNotif = await prisma.notification.create({
          data: {
            title: 'Project Task Overdue',
            message: `Task '${task.title}' in project '${task.project.name}' is overdue!`,
            type: 'DUE_DATE_WARNING',
            userId: task.project.ownerId,
          },
        });

        const pmUnreadCount = await prisma.notification.count({
          where: { userId: task.project.ownerId, isRead: false },
        });

        pushToUser(task.project.ownerId, 'UNREAD_COUNT_CHANGED', {
          unreadCount: pmUnreadCount,
          notification: pmNotif,
        });
      }
    }

    return { count: processedIds.length, overdueTaskIds: processedIds };
  } catch (error) {
    console.error('Overdue scheduler error:', error);
    return { count: 0, overdueTaskIds: [] };
  }
}

/**
 * Initializes recurring background cron job.
 * Runs every 2 minutes in production / development.
 */
export function initOverdueScheduler(): void {
  // Cron pattern: Every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    console.log('⏰ Executing background overdue task scanner job...');
    const result = await checkOverdueTasksNow();
    if (result.count > 0) {
      console.log(`✅ Background Scheduler: Successfully marked ${result.count} task(s) as OVERDUE.`);
    }
  });

  console.log('🚀 Overdue task background scheduler initialized (Cron: every 2 minutes)');
}
