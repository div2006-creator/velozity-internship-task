import { Response } from 'express';
import { PrismaClient, Role, ProjectStatus, Priority, Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { canAccessProject, canModifyProject } from '../utils/rbac';

const prisma = new PrismaClient();

/**
 * GET /api/projects
 * List projects with URL-shareable query parameter filters:
 * ?status=IN_PROGRESS
 * ?priority=HIGH
 * ?clientId=...
 * ?search=...
 * ?sortBy=createdAt|name|startDate|endDate|status|priority
 * ?order=asc|desc
 */
export async function getProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { status, priority, clientId, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    // 1. Role-based base filter
    let roleWhere: Prisma.ProjectWhereInput = {};

    if (user.role === Role.ADMIN) {
      roleWhere = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      roleWhere = { ownerId: user.userId };
    } else if (user.role === Role.DEVELOPER) {
      roleWhere = {
        tasks: {
          some: {
            assignedDeveloperId: user.userId,
          },
        },
      };
    } else if (user.role === Role.CLIENT) {
      roleWhere = {
        client: {
          createdById: user.userId,
        },
      };
    }

    // 2. Query parameter filters
    const filterWhere: Prisma.ProjectWhereInput = {};

    if (status && Object.values(ProjectStatus).includes(status as ProjectStatus)) {
      filterWhere.status = status as ProjectStatus;
    }

    if (priority && Object.values(Priority).includes(priority as Priority)) {
      filterWhere.priority = priority as Priority;
    }

    if (clientId && typeof clientId === 'string') {
      filterWhere.clientId = clientId;
    }

    if (search && typeof search === 'string') {
      filterWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Combine RBAC where and Query parameter filters
    const combinedWhere: Prisma.ProjectWhereInput = {
      AND: [roleWhere, filterWhere],
    };

    // 3. Sorting configuration
    const allowedSortFields = ['createdAt', 'name', 'startDate', 'endDate', 'status', 'priority', 'budget'];
    const sortField = allowedSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const projects = await prisma.project.findMany({
      where: combinedWhere,
      include: {
        client: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { [sortField]: sortOrder },
    });

    res.status(200).json({
      count: projects.length,
      filtersApplied: {
        status: status || null,
        priority: priority || null,
        clientId: clientId || null,
        search: search || null,
        sortBy: sortField,
        order: sortOrder,
      },
      projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

/**
 * GET /api/projects/:id
 */
export async function getProjectById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const hasAccess = await canAccessProject(user, id);
    if (!hasAccess) {
      res.status(403).json({ error: 'Forbidden: You do not have permission to access this project' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignedDeveloper: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error('Get project by id error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

/**
 * POST /api/projects
 */
export async function createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { name, description, status, priority, budget, startDate, endDate, clientId } = req.body;

    if (!name || !clientId) {
      res.status(400).json({ error: 'Project name and clientId are required' });
      return;
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        priority,
        budget: budget ? parseFloat(budget) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        clientId,
        ownerId: user.userId,
      },
      include: {
        client: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_CREATED',
        details: `Project '${project.name}' created by ${user.email}`,
        userId: user.userId,
        projectId: project.id,
      },
    });

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

/**
 * PATCH /api/projects/:id
 */
export async function updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const canModify = await canModifyProject(user, id);
    if (!canModify) {
      res.status(403).json({ error: 'Forbidden: You can only modify projects you created' });
      return;
    }

    const { name, description, status, priority, budget, startDate, endDate } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(budget !== undefined && { budget: parseFloat(budget) }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_UPDATED',
        details: `Project '${updatedProject.name}' updated by ${user.email}`,
        userId: user.userId,
        projectId: id,
      },
    });

    res.status(200).json({ project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

/**
 * DELETE /api/projects/:id
 */
export async function deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const canModify = await canModifyProject(user, id);
    if (!canModify) {
      res.status(403).json({ error: 'Forbidden: You can only delete projects you created' });
      return;
    }

    await prisma.project.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_DELETED',
        details: `Project ID ${id} deleted by ${user.email}`,
        userId: user.userId,
      },
    });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}
