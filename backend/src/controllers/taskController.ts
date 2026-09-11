import { Response } from 'express';
import { PrismaClient, Role, TaskStatus, Priority, Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { canAccessTask } from '../utils/rbac';
import { broadcastToRoom, pushToUser } from '../websocket';
import { formatActivityFeedWording } from '../utils/formatters';

const prisma = new PrismaClient();

/**
 * GET /api/tasks
 */
export async function getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const {
      status,
      priority,
      dueFrom,
      dueTo,
      projectId,
      assignedDeveloperId,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    let roleWhere: Prisma.TaskWhereInput = {};

    if (user.role === Role.ADMIN) {
      roleWhere = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      roleWhere = {
        project: {
          ownerId: user.userId,
        },
      };
    } else if (user.role === Role.DEVELOPER) {
      roleWhere = {
        assignedDeveloperId: user.userId,
      };
    }

    const filterWhere: Prisma.TaskWhereInput = {};

    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      filterWhere.status = status as TaskStatus;
    }

    if (priority && Object.values(Priority).includes(priority as Priority)) {
      filterWhere.priority = priority as Priority;
    }

    if (projectId && typeof projectId === 'string') {
      filterWhere.projectId = projectId;
    }

    if (assignedDeveloperId && typeof assignedDeveloperId === 'string') {
      filterWhere.assignedDeveloperId = assignedDeveloperId;
    }

    if (dueFrom || dueTo) {
      const dateFilter: Prisma.DateTimeNullableFilter = {};
      if (dueFrom && typeof dueFrom === 'string') {
        dateFilter.gte = new Date(dueFrom);
      }
      if (dueTo && typeof dueTo === 'string') {
        const endDateStr = dueTo.includes('T') ? dueTo : `${dueTo}T23:59:59.999Z`;
        dateFilter.lte = new Date(endDateStr);
      }
      filterWhere.dueDate = dateFilter;
    }

    if (search && typeof search === 'string') {
      filterWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const combinedWhere: Prisma.TaskWhereInput = {
      AND: [roleWhere, filterWhere],
    };

    const allowedSortFields = ['dueDate', 'createdAt', 'priority', 'status', 'title'];
    const sortField = allowedSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const tasks = await prisma.task.findMany({
      where: combinedWhere,
      include: {
        project: { select: { id: true, name: true, ownerId: true } },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
      },
      orderBy: { [sortField]: sortOrder },
    });

    res.status(200).json({
      count: tasks.length,
      filtersApplied: {
        status: status || null,
        priority: priority || null,
        dueFrom: dueFrom || null,
        dueTo: dueTo || null,
        projectId: projectId || null,
        assignedDeveloperId: assignedDeveloperId || null,
        search: search || null,
        sortBy: sortField,
        order: sortOrder,
      },
      tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

/**
 * GET /api/tasks/:id
 */
export async function getTaskById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const { allowed, task } = await canAccessTask(user, id);
    if (!allowed || !task) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this task' });
      return;
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error('Get task by id error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
}

/**
 * POST /api/tasks
 */
export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { title, description, status, priority, dueDate, assignedDeveloperId, projectId } = req.body;

    if (!title || !projectId) {
      res.status(400).json({ error: 'Task title and projectId are required' });
      return;
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Target project not found' });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && project.ownerId !== user.userId) {
      res.status(403).json({ error: 'Forbidden: You can only create tasks in projects you created' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || TaskStatus.TODO,
        priority: priority || Priority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedDeveloperId: assignedDeveloperId || null,
        projectId,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
      },
    });

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { name: true } });
    const userName = dbUser?.name || user.email;

    const activityLog = await prisma.activityLog.create({
      data: {
        action: 'TASK_CREATED',
        details: JSON.stringify({
          message: `${userName} created task '${task.title}' in project '${project.name}'`,
          task: { id: task.id, title: task.title },
          user: { id: user.userId, name: userName, email: user.email },
        }),
        userId: user.userId,
        projectId: project.id,
        taskId: task.id,
      },
    });

    broadcastToRoom(`project:${project.id}`, 'TASK_CREATED', {
      task,
      user: { id: user.userId, name: userName, email: user.email },
      activityLogId: activityLog.id,
    });

    // TRIGGER 1: DB-Backed Notification for Task Assigned to Developer & WebSocket Unread Push
    if (assignedDeveloperId) {
      const devNotification = await prisma.notification.create({
        data: {
          title: 'New Task Assigned',
          message: `You were assigned task '${task.title}' in project '${project.name}'`,
          type: 'TASK_ASSIGNED',
          userId: assignedDeveloperId,
        },
      });

      const unreadCount = await prisma.notification.count({
        where: { userId: assignedDeveloperId, isRead: false },
      });

      // WebSocket Push for Unread Count Update (Zero Polling Required)
      pushToUser(assignedDeveloperId, 'UNREAD_COUNT_CHANGED', {
        unreadCount,
        notification: devNotification,
      });
    }

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

/**
 * PATCH /api/tasks/:id
 * Implements DB-backed notifications for:
 * 1. Task Assigned to Developer -> Developer Notification + WebSocket Unread Push
 * 2. Task Moved to In Review -> PM Notification + WebSocket Unread Push
 */
export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const { allowed, task } = await canAccessTask(user, id);
    if (!allowed || !task) {
      res.status(403).json({ error: 'Forbidden: You do not have access to modify this task' });
      return;
    }

    const bodyKeys = Object.keys(req.body);

    if (user.role === Role.DEVELOPER) {
      if (task.assignedDeveloperId !== user.userId) {
        res.status(403).json({ error: 'Forbidden: You can only update tasks assigned to you' });
        return;
      }

      const forbiddenKeys = bodyKeys.filter(key => key !== 'status');
      if (forbiddenKeys.length > 0) {
        res.status(403).json({
          error: `Forbidden: Developers are only permitted to update task status. Forbidden fields: [${forbiddenKeys.join(', ')}]`,
        });
        return;
      }
    }

    if (user.role === Role.PROJECT_MANAGER && task.project.ownerId !== user.userId) {
      res.status(403).json({ error: 'Forbidden: You can only update tasks belonging to projects you created' });
      return;
    }

    const { title, description, status, priority, dueDate, assignedDeveloperId } = req.body;
    const isStatusChange = status && status !== task.status;
    const oldStatus = task.status;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedDeveloperId !== undefined && { assignedDeveloperId }),
      },
      include: {
        project: { select: { id: true, name: true, ownerId: true } },
        assignedDeveloper: { select: { id: true, name: true, email: true } },
      },
    });

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { name: true } });
    const userName = dbUser?.name || user.email.split('@')[0];

    let activityLog = null;
    if (isStatusChange) {
      const timestamp = new Date();
      const feedText = formatActivityFeedWording(userName, updatedTask.title, oldStatus, updatedTask.status);

      const logDetails = JSON.stringify({
        event: 'TASK_STATUS_CHANGED',
        formattedMessage: feedText,
        user: { id: user.userId, name: userName, email: user.email },
        task: { id: updatedTask.id, title: updatedTask.title, projectId: updatedTask.projectId },
        oldStatus,
        newStatus: updatedTask.status,
        timestamp: timestamp.toISOString(),
      });

      activityLog = await prisma.activityLog.create({
        data: {
          action: 'TASK_STATUS_CHANGED',
          details: logDetails,
          userId: user.userId,
          projectId: updatedTask.projectId,
          taskId: id,
          createdAt: timestamp,
        },
      });

      // Broadcast to project room
      broadcastToRoom(`project:${updatedTask.projectId}`, 'TASK_STATUS_CHANGED', {
        formattedMessage: feedText,
        user: { id: user.userId, name: userName, email: user.email },
        task: { id: updatedTask.id, title: updatedTask.title, projectId: updatedTask.projectId },
        oldStatus,
        newStatus: updatedTask.status,
        timestamp: timestamp.toISOString(),
        activityLogId: activityLog.id,
      });

      // TRIGGER 2: DB-Backed Notification when Task Moved to In Review -> PM Notification & WebSocket Unread Push
      if (updatedTask.status === TaskStatus.IN_REVIEW && oldStatus !== TaskStatus.IN_REVIEW) {
        const pmUserId = updatedTask.project.ownerId;
        
        const pmNotification = await prisma.notification.create({
          data: {
            title: 'Task Moved to In Review',
            message: `${userName} moved task '${updatedTask.title}' to In Review in project '${updatedTask.project.name}'`,
            type: 'PROJECT_UPDATE',
            userId: pmUserId,
          },
        });

        const pmUnreadCount = await prisma.notification.count({
          where: { userId: pmUserId, isRead: false },
        });

        // WebSocket Push for Unread Count Update (Zero Polling Required)
        pushToUser(pmUserId, 'UNREAD_COUNT_CHANGED', {
          unreadCount: pmUnreadCount,
          notification: pmNotification,
        });
      }
    } else {
      await prisma.activityLog.create({
        data: {
          action: 'TASK_UPDATED',
          details: JSON.stringify({
            message: `${userName} updated task '${updatedTask.title}'`,
            user: { id: user.userId, name: userName, email: user.email },
            task: { id: updatedTask.id, title: updatedTask.title },
          }),
          userId: user.userId,
          projectId: updatedTask.projectId,
          taskId: id,
        },
      });
    }

    // TRIGGER 1: DB-Backed Notification when Task Assigned/Reassigned -> Developer Notification & WebSocket Unread Push
    if (assignedDeveloperId && assignedDeveloperId !== task.assignedDeveloperId) {
      const devNotification = await prisma.notification.create({
        data: {
          title: 'Task Assigned',
          message: `You were assigned task '${updatedTask.title}' in project '${updatedTask.project.name}'`,
          type: 'TASK_ASSIGNED',
          userId: assignedDeveloperId,
        },
      });

      const unreadCount = await prisma.notification.count({
        where: { userId: assignedDeveloperId, isRead: false },
      });

      pushToUser(assignedDeveloperId, 'UNREAD_COUNT_CHANGED', {
        unreadCount,
        notification: devNotification,
      });
    }

    res.status(200).json({
      task: updatedTask,
      statusChanged: !!isStatusChange,
      ...(activityLog && { activityLog }),
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

/**
 * DELETE /api/tasks/:id
 */
export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const { allowed, task } = await canAccessTask(user, id);
    if (!allowed || !task) {
      res.status(403).json({ error: 'Forbidden: You do not have permission to delete this task' });
      return;
    }

    if (user.role === Role.DEVELOPER) {
      res.status(403).json({ error: 'Forbidden: Developers cannot delete tasks' });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && task.project.ownerId !== user.userId) {
      res.status(403).json({ error: 'Forbidden: You can only delete tasks in projects you created' });
      return;
    }

    await prisma.task.delete({ where: { id } });

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { name: true } });
    const userName = dbUser?.name || user.email;

    await prisma.activityLog.create({
      data: {
        action: 'TASK_DELETED',
        details: JSON.stringify({
          message: `${userName} deleted task ID ${id}`,
          user: { id: user.userId, name: userName, email: user.email },
        }),
        userId: user.userId,
        projectId: task.projectId,
      },
    });

    broadcastToRoom(`project:${task.projectId}`, 'TASK_DELETED', {
      taskId: id,
      projectId: task.projectId,
      user: { id: user.userId, name: userName, email: user.email },
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}
