import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsAsRead);
router.patch('/:id/read', markNotificationAsRead);

export default router;
