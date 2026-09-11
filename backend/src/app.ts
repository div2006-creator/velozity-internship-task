import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import activityRoutes from './routes/activityRoutes';
import notificationRoutes from './routes/notificationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Authentication Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Protected Domain Routes (RBAC Enforced)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/notifications', notificationRoutes);

// API Healthcheck route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'client-project-dashboard-backend',
    timestamp: new Date().toISOString(),
  });
});

// Root API welcome route
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the Client Project Dashboard API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      projects: '/api/projects',
      tasks: '/api/tasks',
      activityLogs: '/api/activity-logs',
      notifications: '/api/notifications',
    },
  });
});

export default app;
