import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { getActivityLogs, getRecentActivities } from '../controllers/activityController';

const router = Router();

router.use(authenticate);
router.get('/', requireRole(Role.PROJECT_MANAGER, Role.ADMIN), getActivityLogs);
router.get('/recent', requireRole(Role.PROJECT_MANAGER, Role.ADMIN), getRecentActivities);

export default router;
