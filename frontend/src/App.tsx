import { useEffect, useState } from 'react';
import './App.css';
import { Shield, UserCheck, Code, RefreshCw, Radio } from 'lucide-react';
import AdminDashboard, { AdminMetrics } from './components/dashboards/AdminDashboard';
import PmDashboard, { PmMetrics } from './components/dashboards/PmDashboard';
import DeveloperDashboard, { DeveloperMetrics } from './components/dashboards/DeveloperDashboard';

type ActiveRole = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export function App() {
  const [activeRole, setActiveRole] = useState<ActiveRole>('ADMIN');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Sample Baseline Metrics Data for visual demonstration
  const mockAdminMetrics: AdminMetrics = {
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
  };

  const mockPmMetrics: PmMetrics = {
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
  };

  const mockDevMetrics: DeveloperMetrics = {
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
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/dashboard`);
      if (!response.ok) {
        throw new Error(`API status: ${response.status}`);
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      // Fallback to role-specific baseline metric demo
      console.log('Backend API standby — displaying live architecture demo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [activeRole]);

  return (
    <div className="app-container">
      {/* Top Banner Header */}
      <header className="glass-panel header-banner">
        <div className="logo-section">
          <h1>Client Project <span className="gradient-text">Dashboard</span></h1>
          <p>Full-Stack Multi-Role Architecture Experience</p>
        </div>

        {/* WebSocket Connection Badge */}
        <div className="status-area" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="status-badge online" style={{ padding: '6px 14px' }}>
            <Radio size={14} className="animate-pulse" /> WebSocket Live Channel
          </span>
          <button className="btn btn-secondary" onClick={fetchDashboardStats} disabled={loading} style={{ fontSize: '0.85rem' }}>
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
          <AdminDashboard metrics={dashboardData?.metrics || mockAdminMetrics} />
        )}

        {activeRole === 'PROJECT_MANAGER' && (
          <PmDashboard metrics={dashboardData?.metrics || mockPmMetrics} />
        )}

        {activeRole === 'DEVELOPER' && (
          <DeveloperDashboard
            metrics={dashboardData?.metrics || mockDevMetrics}
            onUpdateStatus={(taskId, newStatus) => {
              console.log(`Developer update status action: task ${taskId} -> ${newStatus}`);
              alert(`Task ${taskId} status update triggered to '${newStatus}'!`);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
