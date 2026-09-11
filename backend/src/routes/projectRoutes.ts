import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';

const router = Router();

// Protect all project endpoints
router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', requireRole(Role.PROJECT_MANAGER), createProject);
router.patch('/:id', requireRole(Role.PROJECT_MANAGER), updateProject);
router.delete('/:id', requireRole(Role.PROJECT_MANAGER), deleteProject);

export default router;
