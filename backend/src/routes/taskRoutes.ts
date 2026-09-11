import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';

const router = Router();

// Protect all task endpoints
router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', requireRole(Role.PROJECT_MANAGER, Role.ADMIN), createTask);
router.patch('/:id', updateTask); // Access logic handled in controller (Dev: status only, PM: full edit for owned project)
router.delete('/:id', requireRole(Role.PROJECT_MANAGER, Role.ADMIN), deleteTask);

export default router;
