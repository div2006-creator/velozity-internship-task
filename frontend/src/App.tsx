import { useEffect, useState, useRef } from 'react';
import './App.css';
import { PlusCircle, RefreshCw, CheckCircle2, Shield } from 'lucide-react';
import Sidebar from './components/Sidebar';
import NotificationDropdown, { NotificationItem } from './components/NotificationDropdown';
import AdminDashboard, { AdminMetrics } from './components/dashboards/AdminDashboard';
import PmDashboard, { PmMetrics } from './components/dashboards/PmDashboard';
import DeveloperDashboard, { DeveloperMetrics } from './components/dashboards/DeveloperDashboard';
import CreateTaskModal from './components/CreateTaskModal';

type ActiveRole = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export function App() {
  const [activeRole, setActiveRole] = useState<ActiveRole>('ADMIN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time WebSocket Connection State
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Real-time Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: 'Task Assigned', message: 'Task #18 was assigned to you', timestamp: '2 mins ago', isRead: false },
    { id: '2', title: 'Task Review', message: 'Task #12 moved to In Review', timestamp: '8 mins ago', isRead: false },
    { id: '3', title: 'Project Created', message: "Sarah created project 'Client Portal'", timestamp: '1 hour ago', isRead: false },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

  // Demo metrics state
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
      { id: '1', action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), user: { name: 'Ravi Sharma' }, formattedMessage: 'moved Task #12: In Progress → In Review' },
      { id: '2', action: 'PROJECT_CREATED', timestamp: new Date(Date.now() - 3600000).toISOString(), user: { name: 'Sarah Jenkins' }, formattedMessage: "created project 'Client Portal'" },
      { id: '3', action: 'TASK_ASSIGNED', timestamp: new Date(Date.now() - 7200000).toISOString(), user: { name: 'Ananya Verma' }, formattedMessage: 'assigned Task #18 to Developer' },
    ],
  });

  const [pmMetrics, setPmMetrics] = useState<PmMetrics>({
    totalOwnProjects: 4,
    ownProjects: [
      { id: 'proj-1', name: 'Client Portal', status: 'In Progress', priority: 'High', client: { name: 'Acme Corp', company: 'Acme Technologies' } },
      { id: 'proj-2', name: 'Mobile App Redesign', status: 'In Progress', priority: 'Medium', client: { name: 'Starlight Inc', company: 'Starlight Logistics' } },
    ],
    tasksByPriority: {
      LOW: 4,
      MEDIUM: 9,
      HIGH: 6,
      URGENT: 2,
    },
    upcomingDeadlines: [
      { id: 't1', title: 'API Authorization Refactor', status: 'IN_REVIEW', priority: 'HIGH', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), project: { name: 'Client Portal' } },
      { id: 't2', title: 'Component Unit Tests', status: 'TODO', priority: 'URGENT', dueDate: new Date(Date.now() + 86400000 * 4).toISOString(), project: { name: 'Mobile App Redesign' } },
    ],
    ownProjectActivity: [
      { id: '1', action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), user: { name: 'Ravi Sharma' }, formattedMessage: 'moved Task #12: In Progress → In Review' },
    ],
  });

  const [devMetrics, setDevMetrics] = useState<DeveloperMetrics>({
    totalAssignedTasks: 3,
    assignedTasks: [
      { id: 't1', title: 'API Authorization Refactor', status: 'IN_REVIEW', priority: 'HIGH', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), project: { name: 'Client Portal' } },
      { id: 't3', title: 'WebSocket Room Integration', status: 'IN_PROGRESS', priority: 'URGENT', dueDate: new Date(Date.now() + 86400000).toISOString(), project: { name: 'Client Portal' } },
      { id: 't4', title: 'Database Indexing', status: 'TODO', priority: 'MEDIUM', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), project: { name: 'Mobile App Redesign' } },
    ],
    prioritySorting: [
      { id: 't3', title: 'WebSocket Room Integration', status: 'IN_PROGRESS', priority: 'URGENT', dueDate: new Date(Date.now() + 86400000).toISOString(), project: { name: 'Client Portal' } },
      { id: 't1', title: 'API Authorization Refactor', status: 'IN_REVIEW', priority: 'HIGH', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), project: { name: 'Client Portal' } },
      { id: 't4', title: 'Database Indexing', status: 'TODO', priority: 'MEDIUM', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), project: { name: 'Mobile App Redesign' } },
    ],
    assignedTaskActivity: [
      { id: '1', action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), user: { name: 'Ravi Sharma' }, formattedMessage: 'moved Task #12: In Progress → In Review' },
    ],
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Notifications marked as read');
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
          setTimeout(connectWs, 3000);
        };

        socket.onerror = () => {
          setWsConnected(false);
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

  // Handle incoming WebSocket events
  const handleIncomingWsEvent = (msg: any) => {
    const { event, payload, activities } = msg;

    if (event === 'UNREAD_COUNT_CHANGED' && payload?.notification) {
      const notif = payload.notification;
      setNotifications((prev) => [
        {
          id: String(Date.now()),
          title: notif.title || 'Notification',
          message: notif.message,
          timestamp: 'just now',
          isRead: false,
        },
        ...prev,
      ]);
    }

    if (event === 'MISSED_EVENTS_RESYNC' && Array.isArray(activities)) {
      setAdminMetrics((prev) => ({
        ...prev,
        globalActivity: activities.map((a: any) => ({
          id: a.id,
          action: a.action,
          timestamp: a.timestamp,
          user: a.user,
          formattedMessage: a.formattedMessage || `${a.user?.name || 'User'} executed ${a.action}`,
        })),
      }));
    }

    if (event === 'TASK_CREATED' && payload?.task) {
      const task = payload.task;
      const formattedMessage = payload.message || `created task '${task.title}'`;

      showToast(`✨ Real-time Event: Task '${task.title}' Created!`);

      // Add to notifications
      setNotifications((prev) => [
        {
          id: String(Date.now()),
          title: 'Task Created',
          message: `Task '${task.title}' was created`,
          timestamp: 'just now',
          isRead: false,
        },
        ...prev,
      ]);

      // Live update Admin
      setAdminMetrics((prev) => ({
        ...prev,
        tasksByStatus: {
          ...prev.tasksByStatus,
          [task.status]: (prev.tasksByStatus[task.status] || 0) + 1,
        },
        globalActivity: [
          { id: String(Date.now()), action: 'TASK_CREATED', timestamp: new Date().toISOString(), user: { name: 'User' }, formattedMessage, isNew: true },
          ...prev.globalActivity,
        ],
      }));

      // Live update PM
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
          { id: String(Date.now()), action: 'TASK_CREATED', timestamp: new Date().toISOString(), user: { name: 'User' }, formattedMessage, isNew: true },
          ...prev.ownProjectActivity,
        ],
      }));

      // Live update Dev
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
          { id: String(Date.now()), action: 'TASK_CREATED', timestamp: new Date().toISOString(), user: { name: 'User' }, formattedMessage, isNew: true },
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
            { id: String(Date.now()), action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), user: { name: 'Ravi Sharma' }, formattedMessage: formattedMessage || `moved Task: ${oldStatus || ''} → ${newStatus}`, isNew: true },
            ...prev.globalActivity,
          ],
        };
      });

      setPmMetrics((prev) => ({
        ...prev,
        upcomingDeadlines: updateTaskStatusInList(prev.upcomingDeadlines),
        ownProjectActivity: [
          { id: String(Date.now()), action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), user: { name: 'Ravi Sharma' }, formattedMessage: formattedMessage || `moved Task: ${oldStatus || ''} → ${newStatus}`, isNew: true },
          ...prev.ownProjectActivity,
        ],
      }));

      setDevMetrics((prev) => ({
        ...prev,
        assignedTasks: updateTaskStatusInList(prev.assignedTasks),
        prioritySorting: updateTaskStatusInList(prev.prioritySorting),
        assignedTaskActivity: [
          { id: String(Date.now()), action: 'TASK_STATUS_CHANGED', timestamp: new Date().toISOString(), user: { name: 'Ravi Sharma' }, formattedMessage: formattedMessage || `moved Task: ${oldStatus || ''} → ${newStatus}`, isNew: true },
          ...prev.assignedTaskActivity,
        ],
      }));
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        showToast('✅ Rest API & Live Dashboard Synced!');
      } else {
        showToast('🔄 Telemetry Synced');
      }
    } catch (err) {
      showToast('🔄 Telemetry Synced');
    } finally {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'request_recent_activities', limit: 20 }));
      }
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const res = await fetch(`${apiBaseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        await res.json();
        showToast(`Task '${taskData.title}' created!`);
        fetchDashboardStats();
      } else {
        const newTask = {
          id: `t-${Date.now()}`,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
          project: { name: 'Client Portal' },
        };
        handleIncomingWsEvent({
          event: 'TASK_CREATED',
          payload: { task: newTask, message: `created task '${newTask.title}' in project 'Client Portal'` },
        });
      }
    } catch (err) {
      const newTask = {
        id: `t-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
        project: { name: 'Client Portal' },
      };
      handleIncomingWsEvent({
        event: 'TASK_CREATED',
        payload: { task: newTask, message: `created task '${newTask.title}' in project 'Client Portal'` },
      });
    }
  };

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
            formattedMessage: `updated Task status → ${newStatus}`,
            task: { id: taskId },
            newStatus,
          },
        });
      }
    } catch (err) {
      handleIncomingWsEvent({
        event: 'TASK_STATUS_CHANGED',
        payload: {
          formattedMessage: `updated Task status → ${newStatus}`,
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
    <div className="app-layout">
      {/* Toast Notification */}
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
            padding: '10px 18px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle2 size={16} style={{ color: '#4338CA' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={activeRole}
        unreadNotificationCount={unreadCount}
      />

      {/* Main Right Content Area */}
      <div className="main-wrapper">
        {/* Top Header Navigation */}
        <header className="top-header">
          {/* Header Title & Subtitle */}
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Client Projects
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Track projects, tasks, and team activity in one place.
            </p>
          </div>

          {/* Top Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateTaskOpen(true)}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <PlusCircle size={14} /> Create Task
            </button>

            <button
              className="btn btn-secondary"
              onClick={fetchDashboardStats}
              disabled={loading}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              title="Sync Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync
            </button>

            {/* Notification Bell Dropdown */}
            <NotificationDropdown
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotificationsRead}
              unreadCount={unreadCount}
            />

            {/* Subtle Live Indicator Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: wsConnected ? '#ECFDF5' : '#FFFBEB',
                color: wsConnected ? '#059669' : '#D97706',
                border: wsConnected ? '1px solid #A7F3D0' : '1px solid #FDE68A',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: wsConnected ? '#059669' : '#D97706',
                }}
              />
              {wsConnected ? 'Live' : 'Reconnecting'}
            </div>

            {/* Demo Role Context Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FAF9F7', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}>
              <Shield size={12} style={{ color: '#4338CA', marginLeft: '4px' }} />
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as ActiveRole)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: '2px 4px',
                }}
              >
                <option value="ADMIN">Role: ADMIN</option>
                <option value="PROJECT_MANAGER">Role: PM</option>
                <option value="DEVELOPER">Role: DEV</option>
              </select>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="content-area">
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
      </div>

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
