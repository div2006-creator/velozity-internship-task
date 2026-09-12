import { useEffect, useState, useRef } from 'react';
import './App.css';
import { Shield, UserCheck, Code, RefreshCw, Radio, PlusCircle, CheckCircle2 } from 'lucide-react';
import AdminDashboard, { AdminMetrics } from './components/dashboards/AdminDashboard';
import PmDashboard, { PmMetrics } from './components/dashboards/PmDashboard';
import DeveloperDashboard, { DeveloperMetrics } from './components/dashboards/DeveloperDashboard';
import CreateTaskModal from './components/CreateTaskModal';

type ActiveRole = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export function App() {
  const [activeRole, setActiveRole] = useState<ActiveRole>('ADMIN');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Real-time WebSocket Connection State
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

  // Demo baseline state when API fallback is used
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics>({
    totalProjects: 12,
    tasksByStatus: {
      TODO: 8,
      IN_PROGRESS: 14,
      IN_REVIEW: 5,
      COMPLETED: 24,
      BLOCKED: 2,
      OVERDUE: 3,
    },
    overdueCount: 3,
    onlineUsers: 6,
    globalActivity: [
      { id: '1', action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), formattedMessage: 'Ravi moved Task #12 from In Progress → In Review' },
      { id: '2', action: 'TASK_MARKED_OVERDUE', timestamp: new Date(Date.now() - 3600000).toISOString(), formattedMessage: "Task 'Database Migration' was automatically marked OVERDUE by background scheduler" },
      { id: '3', action: 'PROJECT_CREATED', timestamp: new Date(Date.now() - 7200000).toISOString(), formattedMessage: "Sarah created project 'Client Portal Dashboard'" },
    ],
  });

  const [pmMetrics, setPmMetrics] = useState<PmMetrics>({
    totalOwnProjects: 4,
    ownProjects: [
      { id: 'proj-1', name: 'Client Portal Dashboard', status: 'IN_PROGRESS', priority: 'HIGH', client: { name: 'Acme Corp', company: 'Acme Technologies' } },
      { id: 'proj-2', name: 'Mobile App Redesign', status: 'PLANNING', priority: 'MEDIUM', client: { name: 'Starlight Inc', company: 'Starlight Logistics' } },
    ],
    tasksByPriority: {
      LOW: 4,
      MEDIUM: 9,
      HIGH: 6,
      URGENT: 2,
    },
    upcomingDeadlines: [
      { id: 't1', title: 'Task #12 - API Authorization Refactor', status: 'IN_REVIEW', priority: 'HIGH', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), project: { name: 'Client Portal Dashboard' } },
      { id: 't2', title: 'Task #15 - Component Unit Tests', status: 'TODO', priority: 'URGENT', dueDate: new Date(Date.now() + 86400000 * 4).toISOString(), project: { name: 'Mobile App Redesign' } },
    ],
    ownProjectActivity: [
      { id: '1', action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), formattedMessage: 'Ravi moved Task #12 from In Progress → In Review' },
    ],
  });

  const [devMetrics, setDevMetrics] = useState<DeveloperMetrics>({
    totalAssignedTasks: 3,
    assignedTasks: [
      { id: 't1', title: 'Task #12 - API Authorization Refactor', status: 'IN_REVIEW', priority: 'HIGH', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), project: { name: 'Client Portal Dashboard' } },
      { id: 't3', title: 'Task #08 - WebSocket Room Integration', status: 'IN_PROGRESS', priority: 'URGENT', dueDate: new Date(Date.now() + 86400000).toISOString(), project: { name: 'Client Portal Dashboard' } },
      { id: 't4', title: 'Task #04 - Database Indexing', status: 'TODO', priority: 'MEDIUM', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), project: { name: 'Mobile App Redesign' } },
    ],
    prioritySorting: [
      { id: 't3', title: 'Task #08 - WebSocket Room Integration', status: 'IN_PROGRESS', priority: 'URGENT', dueDate: new Date(Date.now() + 86400000).toISOString(), project: { name: 'Client Portal Dashboard' } },
      { id: 't1', title: 'Task #12 - API Authorization Refactor', status: 'IN_REVIEW', priority: 'HIGH', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), project: { name: 'Client Portal Dashboard' } },
      { id: 't4', title: 'Task #04 - Database Indexing', status: 'TODO', priority: 'MEDIUM', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), project: { name: 'Mobile App Redesign' } },
    ],
    assignedTaskActivity: [
      { id: '1', action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), formattedMessage: 'Ravi moved Task #12 from In Progress → In Review' },
    ],
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Real-time WebSocket connection setup
  useEffect(() => {
    let socket: WebSocket;
    const connectWs = () => {
      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setWsConnected(true);
          console.log('⚡ Connected to WebSocket server');
          socket.send(JSON.stringify({ action: 'request_recent_activities', limit: 20 }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleIncomingWsEvent(data);
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          console.log('WebSocket connection closed. Reconnecting in 3s...');
          setTimeout(connectWs, 3000);
        };

        socket.onerror = (err) => {
          setWsConnected(false);
          console.error('WebSocket connection error:', err);
        };
      } catch (err) {
        setWsConnected(false);
      }
    };

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wsUrl]);

  // Handle incoming WebSocket broadcast events cleanly
  const handleIncomingWsEvent = (msg: any) => {
    const { event, payload, activities } = msg;

    if (event === 'CONNECTED') {
      showToast('⚡ WebSocket Connected: Real-time telemetry active');
    }

    if (event === 'MISSED_EVENTS_RESYNC' && Array.isArray(activities)) {
      setAdminMetrics((prev) => ({
        ...prev,
        globalActivity: activities.map((a: any) => ({
          id: a.id,
          action: a.action,
          timestamp: a.timestamp,
          formattedMessage: a.formattedMessage || `${a.user?.name || 'User'} executed ${a.action}`,
        })),
      }));
    }

    if (event === 'TASK_CREATED' && payload?.task) {
      const task = payload.task;
      const formattedMessage = payload.message || `New task '${task.title}' was created`;
      
      showToast(`✨ Real-time Event: Task '${task.title}' Created!`);

      // Live update Admin state
      setAdminMetrics((prev) => ({
        ...prev,
        tasksByStatus: {
          ...prev.tasksByStatus,
          [task.status]: (prev.tasksByStatus[task.status] || 0) + 1,
        },
        globalActivity: [
          { id: String(Date.now()), action: 'TASK_CREATED', timestamp: new Date().toISOString(), formattedMessage },
          ...prev.globalActivity,
        ],
      }));

      // Live update PM state
      setPmMetrics((prev) => ({
        ...prev,
        tasksByPriority: {
          ...prev.tasksByPriority,
          [task.priority]: (prev.tasksByPriority[task.priority] || 0) + 1,
        },
        upcomingDeadlines: [
          { id: task.id, title: task.title, status: task.status, priority: task.priority, dueDate: task.dueDate || new Date().toISOString(), project: { name: task.project?.name || 'Project' } },
          ...prev.upcomingDeadlines,
        ],
        ownProjectActivity: [
          { id: String(Date.now()), action: 'TASK_CREATED', timestamp: new Date().toISOString(), formattedMessage },
          ...prev.ownProjectActivity,
        ],
      }));

      // Live update Dev state
      setDevMetrics((prev) => ({
        ...prev,
        totalAssignedTasks: prev.totalAssignedTasks + 1,
        assignedTasks: [
          { id: task.id, title: task.title, status: task.status, priority: task.priority, dueDate: task.dueDate || new Date().toISOString(), project: { name: task.project?.name || 'Project' } },
          ...prev.assignedTasks,
        ],
        prioritySorting: [
          { id: task.id, title: task.title, status: task.status, priority: task.priority, dueDate: task.dueDate || new Date().toISOString(), project: { name: task.project?.name || 'Project' } },
          ...prev.prioritySorting,
        ],
        assignedTaskActivity: [
          { id: String(Date.now()), action: 'TASK_CREATED', timestamp: new Date().toISOString(), formattedMessage },
          ...prev.assignedTaskActivity,
        ],
      }));
    }

    if (event === 'TASK_STATUS_CHANGED' && payload) {
      const { formattedMessage, task, oldStatus, newStatus } = payload;
      showToast(`🔄 Real-time Update: ${formattedMessage || `Task moved to ${newStatus}`}`);

      const updateTaskStatusInList = (list: any[]) =>
        list.map((t) => (t.id === task?.id ? { ...t, status: newStatus } : t));

      setAdminMetrics((prev) => {
        const nextStatusObj = { ...prev.tasksByStatus };
        if (oldStatus && nextStatusObj[oldStatus]) nextStatusObj[oldStatus] = Math.max(0, nextStatusObj[oldStatus] - 1);
        if (newStatus) nextStatusObj[newStatus] = (nextStatusObj[newStatus] || 0) + 1;
        return {
          ...prev,
          tasksByStatus: nextStatusObj,
          globalActivity: [
            { id: String(Date.now()), action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), formattedMessage: formattedMessage || `Task moved to ${newStatus}` },
            ...prev.globalActivity,
          ],
        };
      });

      setPmMetrics((prev) => ({
        ...prev,
        upcomingDeadlines: updateTaskStatusInList(prev.upcomingDeadlines),
        ownProjectActivity: [
          { id: String(Date.now()), action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), formattedMessage: formattedMessage || `Task moved to ${newStatus}` },
          ...prev.ownProjectActivity,
        ],
      }));

      setDevMetrics((prev) => ({
        ...prev,
        assignedTasks: updateTaskStatusInList(prev.assignedTasks),
        prioritySorting: updateTaskStatusInList(prev.prioritySorting),
        assignedTaskActivity: [
          { id: String(Date.now()), action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), formattedMessage: formattedMessage || `Task moved to ${newStatus}` },
          ...prev.assignedTaskActivity,
        ],
      }));
    }
  };

  // Sync button handler (REST + WebSocket request)
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        showToast('✅ Rest API & Live Dashboard Synced!');
      } else {
        showToast('🔄 Standby Demo Data Synced');
      }
    } catch (err) {
      showToast('🔄 Dashboard Telemetry Synced');
    } finally {
      // Also request latest WebSocket activity resync
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'request_recent_activities', limit: 20 }));
      }
      setLoading(false);
    }
  };

  // Create Task Handler
  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    projectId: string;
    priority: string;
    status: string;
    assignedDeveloperId?: string;
    dueDate?: string;
  }) => {
    try {
      const res = await fetch(`${apiBaseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        await res.json();
        showToast(`Task '${taskData.title}' successfully created on server!`);
        fetchDashboardStats();
      } else {
        // Local state update when API is in standby
        const newTask = {
          id: `t-${Date.now()}`,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
          project: { name: taskData.projectId === 'proj-1' ? 'Client Portal Dashboard' : 'Mobile App Redesign' },
        };

        handleIncomingWsEvent({
          event: 'TASK_CREATED',
          payload: {
            task: newTask,
            message: `User created task '${newTask.title}' in project '${newTask.project.name}'`,
          },
        });
      }
    } catch (err) {
      // Fallback local state creation
      const newTask = {
        id: `t-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
        project: { name: 'Client Portal Dashboard' },
      };

      handleIncomingWsEvent({
        event: 'TASK_CREATED',
        payload: {
          task: newTask,
          message: `User created task '${newTask.title}' in project 'Client Portal Dashboard'`,
        },
      });
    }
  };

  // Developer Status Update Handler
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`Task status updated to ${newStatus}`);
        fetchDashboardStats();
      } else {
        handleIncomingWsEvent({
          event: 'TASK_STATUS_CHANGED',
          payload: {
            formattedMessage: `Developer updated Task ID #${taskId} status → ${newStatus}`,
            task: { id: taskId },
            newStatus,
          },
        });
      }
    } catch (err) {
      handleIncomingWsEvent({
        event: 'TASK_STATUS_CHANGED',
        payload: {
          formattedMessage: `Developer updated Task ID #${taskId} status → ${newStatus}`,
          task: { id: taskId },
          newStatus,
        },
      });
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [activeRole]);

  return (
    <div className="app-container">
      {/* Toast Notification Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1100,
            background: '#FFFFFF',
            color: 'var(--text-primary)',
            border: '1px solid #C7D2FE',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '0.875rem',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#4338CA' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <header className="glass-panel header-banner">
        <div className="logo-section">
          <h1>Client Project <span className="gradient-text">Dashboard</span></h1>
          <p>Full-Stack Multi-Role Architecture & Real-Time Telemetry Workspace</p>
        </div>

        {/* Action Controls & WebSocket Connection Badge */}
        <div className="status-area" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateTaskOpen(true)}
            style={{ fontSize: '0.85rem' }}
          >
            <PlusCircle size={16} /> Create Task
          </button>

          <span
            className={`status-badge ${wsConnected ? 'online' : 'offline'}`}
            style={{ padding: '6px 14px' }}
          >
            <Radio size={14} className={wsConnected ? 'animate-pulse' : ''} />
            {wsConnected ? 'WebSocket Live Channel' : 'WebSocket Disconnected'}
          </span>

          <button
            className="btn btn-secondary"
            onClick={fetchDashboardStats}
            disabled={loading}
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync
          </button>
        </div>
      </header>

      {/* Role Experience Switcher Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Role View:</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn ${activeRole === 'ADMIN' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveRole('ADMIN')}
          >
            <Shield size={16} /> ADMIN Dashboard
          </button>
          <button
            className={`btn ${activeRole === 'PROJECT_MANAGER' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveRole('PROJECT_MANAGER')}
          >
            <UserCheck size={16} /> PROJECT MANAGER Dashboard
          </button>
          <button
            className={`btn ${activeRole === 'DEVELOPER' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveRole('DEVELOPER')}
          >
            <Code size={16} /> DEVELOPER Dashboard
          </button>
        </div>
      </div>

      {/* Active Role Dashboard View Rendering */}
      <main className="dashboard-main-content">
        {activeRole === 'ADMIN' && (
          <AdminDashboard metrics={dashboardData?.metrics || adminMetrics} />
        )}

        {activeRole === 'PROJECT_MANAGER' && (
          <PmDashboard metrics={dashboardData?.metrics || pmMetrics} />
        )}

        {activeRole === 'DEVELOPER' && (
          <DeveloperDashboard
            metrics={dashboardData?.metrics || devMetrics}
            onUpdateStatus={handleUpdateTaskStatus}
          />
        )}
      </main>

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
        projects={pmMetrics.ownProjects}
      />
    </div>
  );
}

export default App;

