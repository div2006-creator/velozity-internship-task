import { PrismaClient, Role, Project, Task } from '@prisma/client';
import { TokenPayload } from './token';

const prisma = new PrismaClient();

export async function canAccessProject(user: TokenPayload, projectId: string): Promise<boolean> {
  if (user.role === Role.ADMIN) return true;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: true },
  });

  if (!project) return false;

  if (user.role === Role.PROJECT_MANAGER) {
    return project.ownerId === user.userId;
  }

  if (user.role === Role.DEVELOPER) {
    return project.tasks.some(task => task.assignedDeveloperId === user.userId);
  }

  if (user.role === Role.CLIENT) {
    // Check if user is linked to client of this project
    const client = await prisma.client.findUnique({ where: { id: project.clientId } });
    return client?.createdById === user.userId || client?.email === user.email;
  }

  return false;
}

export async function canModifyProject(user: TokenPayload, projectId: string): Promise<boolean> {
  if (user.role === Role.ADMIN) return true;

  if (user.role === Role.PROJECT_MANAGER) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    return project?.ownerId === user.userId;
  }

  return false;
}

export async function canAccessTask(user: TokenPayload, taskId: string): Promise<{ allowed: boolean; task?: Task & { project: Project } }> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task) return { allowed: false };

  if (user.role === Role.ADMIN) return { allowed: true, task };

  if (user.role === Role.PROJECT_MANAGER) {
    return { allowed: task.project.ownerId === user.userId, task };
  }

  if (user.role === Role.DEVELOPER) {
    return { allowed: task.assignedDeveloperId === user.userId, task };
  }

  return { allowed: false };
}
