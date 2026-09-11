import { PrismaClient, Role, ProjectStatus, TaskStatus, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed execution...');

  // 1. Hash default password for seed users
  const defaultPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 2. Create Users
  console.log('👤 Creating users (1 Admin, 2 PMs, 4 Developers)...');

  // 1 Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dashboard.com' },
    update: {},
    create: {
      email: 'admin@dashboard.com',
      passwordHash,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  // 2 Project Managers
  const pmSarah = await prisma.user.upsert({
    where: { email: 'pm.sarah@dashboard.com' },
    update: {},
    create: {
      email: 'pm.sarah@dashboard.com',
      passwordHash,
      name: 'Sarah Jenkins',
      role: Role.PROJECT_MANAGER,
    },
  });

  const pmDavid = await prisma.user.upsert({
    where: { email: 'pm.david@dashboard.com' },
    update: {},
    create: {
      email: 'pm.david@dashboard.com',
      passwordHash,
      name: 'David Chen',
      role: Role.PROJECT_MANAGER,
    },
  });

  // 4 Developers
  const devRavi = await prisma.user.upsert({
    where: { email: 'dev.ravi@dashboard.com' },
    update: {},
    create: {
      email: 'dev.ravi@dashboard.com',
      passwordHash,
      name: 'Ravi Kumar',
      role: Role.DEVELOPER,
    },
  });

  const devElena = await prisma.user.upsert({
    where: { email: 'dev.elena@dashboard.com' },
    update: {},
    create: {
      email: 'dev.elena@dashboard.com',
      passwordHash,
      name: 'Elena Rostova',
      role: Role.DEVELOPER,
    },
  });

  const devMarcus = await prisma.user.upsert({
    where: { email: 'dev.marcus@dashboard.com' },
    update: {},
    create: {
      email: 'dev.marcus@dashboard.com',
      passwordHash,
      name: 'Marcus Vance',
      role: Role.DEVELOPER,
    },
  });

  const devAisha = await prisma.user.upsert({
    where: { email: 'dev.aisha@dashboard.com' },
    update: {},
    create: {
      email: 'dev.aisha@dashboard.com',
      passwordHash,
      name: 'Aisha Patel',
      role: Role.DEVELOPER,
    },
  });

  // 3. Create Clients
  console.log('🏢 Creating clients...');
  const clientAcme = await prisma.client.upsert({
    where: { email: 'contact@acmecorp.com' },
    update: {},
    create: {
      name: 'Acme Enterprises',
      company: 'Acme Global Ltd',
      email: 'contact@acmecorp.com',
      phone: '+1-555-0199',
      createdById: admin.id,
    },
  });

  const clientStarlight = await prisma.client.upsert({
    where: { email: 'info@starlightmedia.com' },
    update: {},
    create: {
      name: 'Starlight Media',
      company: 'Starlight Digital Group',
      email: 'info@starlightmedia.com',
      phone: '+1-555-0288',
      createdById: pmSarah.id,
    },
  });

  // 4. Create 4 Projects (>3)
  console.log('📁 Creating projects (4 total)...');
  const project1 = await prisma.project.create({
    data: {
      name: 'Enterprise Client Portal',
      description: 'Full-stack dashboard portal for enterprise client management.',
      status: ProjectStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      budget: 75000,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-11-30'),
      clientId: clientAcme.id,
      ownerId: pmSarah.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Cross-platform React Native mobile dashboard redesign.',
      status: ProjectStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      budget: 45000,
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-12-15'),
      clientId: clientStarlight.id,
      ownerId: pmSarah.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'E-Commerce Cloud Migration',
      description: 'Cloud infrastructure migration and database optimization.',
      status: ProjectStatus.PLANNING,
      priority: Priority.URGENT,
      budget: 120000,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-01-31'),
      clientId: clientAcme.id,
      ownerId: pmDavid.id,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'AI Analytics Pipeline',
      description: 'Real-time analytics engine and prediction data pipeline.',
      status: ProjectStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      budget: 95000,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-10-31'),
      clientId: clientStarlight.id,
      ownerId: pmDavid.id,
    },
  });

  // 5. Create Tasks (22 total - 5+ per project, 4 Overdue tasks, varied statuses)
  console.log('📋 Creating tasks (22 total tasks across projects with 4 OVERDUE)...');

  const now = new Date();
  const pastDueDate1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const pastDueDate2 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
  const futureDueDate1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days ahead
  const futureDueDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days ahead

  const tasksData = [
    // --- Project 1 Tasks (6 tasks) ---
    { title: 'Task #101 - Database Schema & Indexing', status: TaskStatus.COMPLETED, priority: Priority.HIGH, dueDate: pastDueDate1, assignedDeveloperId: devRavi.id, projectId: project1.id },
    { title: 'Task #102 - JWT Authentication API', status: TaskStatus.COMPLETED, priority: Priority.HIGH, dueDate: pastDueDate1, assignedDeveloperId: devRavi.id, projectId: project1.id },
    { title: 'Task #12 - API Authorization Refactor', status: TaskStatus.IN_REVIEW, priority: Priority.URGENT, dueDate: futureDueDate1, assignedDeveloperId: devRavi.id, projectId: project1.id },
    { title: 'Task #104 - WebSocket Room Setup', status: TaskStatus.IN_PROGRESS, priority: Priority.MEDIUM, dueDate: futureDueDate1, assignedDeveloperId: devElena.id, projectId: project1.id },
    { title: 'Task #105 - Legacy Data Import', status: TaskStatus.OVERDUE, priority: Priority.HIGH, dueDate: pastDueDate2, assignedDeveloperId: devElena.id, projectId: project1.id },
    { title: 'Task #106 - UI Glassmorphic Styling', status: TaskStatus.TODO, priority: Priority.LOW, dueDate: futureDueDate2, assignedDeveloperId: devMarcus.id, projectId: project1.id },

    // --- Project 2 Tasks (5 tasks) ---
    { title: 'Task #201 - Mobile Screen Wireframing', status: TaskStatus.COMPLETED, priority: Priority.MEDIUM, dueDate: pastDueDate1, assignedDeveloperId: devElena.id, projectId: project2.id },
    { title: 'Task #202 - Navigation Drawer Component', status: TaskStatus.IN_PROGRESS, priority: Priority.MEDIUM, dueDate: futureDueDate1, assignedDeveloperId: devMarcus.id, projectId: project2.id },
    { title: 'Task #203 - Push Notification Engine', status: TaskStatus.OVERDUE, priority: Priority.URGENT, dueDate: pastDueDate1, assignedDeveloperId: devMarcus.id, projectId: project2.id },
    { title: 'Task #204 - User Profile Settings Screen', status: TaskStatus.BLOCKED, priority: Priority.LOW, dueDate: futureDueDate2, assignedDeveloperId: devAisha.id, projectId: project2.id },
    { title: 'Task #205 - Offline Storage Synchronization', status: TaskStatus.TODO, priority: Priority.HIGH, dueDate: futureDueDate2, assignedDeveloperId: devAisha.id, projectId: project2.id },

    // --- Project 3 Tasks (5 tasks) ---
    { title: 'Task #301 - Infrastructure Architecture Audit', status: TaskStatus.IN_PROGRESS, priority: Priority.URGENT, dueDate: futureDueDate1, assignedDeveloperId: devAisha.id, projectId: project3.id },
    { title: 'Task #302 - Postgres DB Cluster Setup', status: TaskStatus.OVERDUE, priority: Priority.HIGH, dueDate: pastDueDate2, assignedDeveloperId: devAisha.id, projectId: project3.id },
    { title: 'Task #303 - Redis Caching Strategy', status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: futureDueDate2, assignedDeveloperId: devRavi.id, projectId: project3.id },
    { title: 'Task #304 - SSL Certificate Configuration', status: TaskStatus.COMPLETED, priority: Priority.LOW, dueDate: pastDueDate1, assignedDeveloperId: devElena.id, projectId: project3.id },
    { title: 'Task #305 - Load Balancer Testing', status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: futureDueDate2, assignedDeveloperId: devMarcus.id, projectId: project3.id },

    // --- Project 4 Tasks (6 tasks) ---
    { title: 'Task #401 - Data Pipeline Ingestion API', status: TaskStatus.COMPLETED, priority: Priority.HIGH, dueDate: pastDueDate1, assignedDeveloperId: devRavi.id, projectId: project4.id },
    { title: 'Task #402 - Spark Stream Aggregator', status: TaskStatus.IN_PROGRESS, priority: Priority.URGENT, dueDate: futureDueDate1, assignedDeveloperId: devElena.id, projectId: project4.id },
    { title: 'Task #403 - Predictive Model Training', status: TaskStatus.OVERDUE, priority: Priority.URGENT, dueDate: pastDueDate2, assignedDeveloperId: devMarcus.id, projectId: project4.id },
    { title: 'Task #404 - Metric Reporting Dashboard API', status: TaskStatus.IN_REVIEW, priority: Priority.HIGH, dueDate: futureDueDate1, assignedDeveloperId: devAisha.id, projectId: project4.id },
    { title: 'Task #405 - Real-Time Alert Engine', status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: futureDueDate2, assignedDeveloperId: devRavi.id, projectId: project4.id },
    { title: 'Task #406 - Automated CSV Export Worker', status: TaskStatus.BLOCKED, priority: Priority.LOW, dueDate: futureDueDate2, assignedDeveloperId: devElena.id, projectId: project4.id },
  ];

  for (const t of tasksData) {
    await prisma.task.create({ data: t });
  }

  // 6. Create Activity Logs (12+ logs with exact feed wording)
  console.log('📝 Creating activity logs...');
  const logsData = [
    {
      action: 'TASK_STATUS_CHANGED',
      details: JSON.stringify({
        event: 'TASK_STATUS_CHANGED',
        formattedMessage: 'Ravi Kumar moved Task #12 - API Authorization Refactor from In Progress → In Review',
        user: { id: devRavi.id, name: 'Ravi Kumar', email: devRavi.email },
        task: { title: 'Task #12 - API Authorization Refactor' },
        oldStatus: 'IN_PROGRESS',
        newStatus: 'IN_REVIEW',
      }),
      userId: devRavi.id,
      projectId: project1.id,
    },
    {
      action: 'TASK_MARKED_OVERDUE',
      details: JSON.stringify({
        event: 'TASK_MARKED_OVERDUE',
        formattedMessage: "Task 'Task #105 - Legacy Data Import' in project 'Enterprise Client Portal' was automatically marked OVERDUE by background scheduler",
        oldStatus: 'IN_PROGRESS',
        newStatus: 'OVERDUE',
      }),
      userId: admin.id,
      projectId: project1.id,
    },
    {
      action: 'PROJECT_CREATED',
      details: JSON.stringify({
        event: 'PROJECT_CREATED',
        formattedMessage: "Sarah Jenkins created project 'Enterprise Client Portal'",
        user: { id: pmSarah.id, name: 'Sarah Jenkins' },
      }),
      userId: pmSarah.id,
      projectId: project1.id,
    },
    {
      action: 'TASK_STATUS_CHANGED',
      details: JSON.stringify({
        event: 'TASK_STATUS_CHANGED',
        formattedMessage: 'Elena Rostova moved Task #404 - Metric Reporting Dashboard API from In Progress → In Review',
        user: { id: devElena.id, name: 'Elena Rostova' },
        oldStatus: 'IN_PROGRESS',
        newStatus: 'IN_REVIEW',
      }),
      userId: devElena.id,
      projectId: project4.id,
    },
    {
      action: 'TASK_MARKED_OVERDUE',
      details: JSON.stringify({
        event: 'TASK_MARKED_OVERDUE',
        formattedMessage: "Task 'Task #203 - Push Notification Engine' in project 'Mobile App Redesign' was automatically marked OVERDUE by background scheduler",
        oldStatus: 'TODO',
        newStatus: 'OVERDUE',
      }),
      userId: admin.id,
      projectId: project2.id,
    },
  ];

  for (const log of logsData) {
    await prisma.activityLog.create({ data: log });
  }

  console.log('✅ Database seeding complete!');
  console.log('----------------------------------------------------');
  console.log('Seed Credentials (Password for all users: Password123!)');
  console.log('🔑 Admin:              admin@dashboard.com');
  console.log('🔑 PM 1:                pm.sarah@dashboard.com');
  console.log('🔑 PM 2:                pm.david@dashboard.com');
  console.log('🔑 Developer 1 (Ravi):  dev.ravi@dashboard.com');
  console.log('🔑 Developer 2 (Elena): dev.elena@dashboard.com');
  console.log('🔑 Developer 3 (Marcus):dev.marcus@dashboard.com');
  console.log('🔑 Developer 4 (Aisha): dev.aisha@dashboard.com');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
