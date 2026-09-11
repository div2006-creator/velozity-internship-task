import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateUser, me);

export default router;
