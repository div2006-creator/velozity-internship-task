import React, { useState } from 'react';
import { PlusCircle, Clock, CheckCircle } from 'lucide-react';

interface TasksViewProps {
  onCreateTaskClick: () => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onCreateTaskClick, onUpdateStatus }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const initialTasks = [
    { id: 't1', title: 'Task #12 - API Authorization Refactor', project: 'Client Portal', status: 'IN_REVIEW', priority: 'HIGH', dueDate: '2026-09-15', developer: 'Ravi Sharma' },
    { id: 't2', title: 'Task #15 - Component Unit Tests', project: 'Mobile App Redesign', status: 'TODO', priority: 'URGENT', dueDate: '2026-09-17', developer: 'Ananya Verma' },
    { id: 't3', title: 'Task #08 - WebSocket Room Integration', project: 'Client Portal', status: 'IN_PROGRESS', priority: 'URGENT', dueDate: '2026-09-13', developer: 'Dev User 1' },
    { id: 't4', title: 'Task #04 - Database Indexing', project: 'Mobile App Redesign', status: 'TODO', priority: 'MEDIUM', dueDate: '2026-09-20', developer: 'Dev User 2' },
    { id: 't5', title: 'Task #01 - Auth Token Cookie Migration', project: 'Database Migration', status: 'COMPLETED', priority: 'LOW', dueDate: '2026-09-10', developer: 'Sarah Jenkins' },
  ];

  const filteredTasks = initialTasks.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'OVERDUE') return new Date(t.dueDate).getTime() < Date.now() && t.status !== 'COMPLETED';
    return t.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tasks</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>View, filter, and update task statuses across all projects.</p>
        </div>
        <button className="btn btn-primary" onClick={onCreateTaskClick} style={{ fontSize: '0.8rem' }}>
          <PlusCircle size={14} /> Create Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'OVERDUE'].map((st) => {
          const isActive = filter === st;
          const labels: Record<string, string> = {
            ALL: 'All Tasks',
            TODO: 'To Do',
            IN_PROGRESS: 'In Progress',
            IN_REVIEW: 'In Review',
            COMPLETED: 'Done',
            OVERDUE: 'Overdue',
          };
          return (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: isActive ? '1px solid #4338CA' : '1px solid var(--border-color)',
                background: isActive ? '#EEF2FF' : '#FFFFFF',
                color: isActive ? '#4338CA' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {labels[st]}
            </button>
          );
        })}
      </div>

      {/* Tasks Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Priority</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Task Title</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Project</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Assignee</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Due Date</th>
                <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No tasks found matching filter '{filter}'.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const priorityStyles: Record<string, { label: string; color: string; bg: string; border: string }> = {
                    LOW: { label: 'Low', color: '#52525B', bg: '#F4F4F5', border: '#E4E4E7' },
                    MEDIUM: { label: 'Medium', color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
                    HIGH: { label: 'High', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
                    URGENT: { label: 'Critical', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
                  };
                  const pStyle = priorityStyles[t.priority] || priorityStyles.MEDIUM;
                  const statusDisplay = t.status === 'COMPLETED' ? 'Done' : t.status.replace('_', ' ');

                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}`, padding: '2px 6px', borderRadius: '4px' }}>
                          {pStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.title}
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--text-secondary)' }}>
                        {t.project}
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--text-muted)' }}>
                        {t.developer}
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        <span className="status-badge online" style={{ fontSize: '0.7rem' }}>
                          {statusDisplay}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--text-muted)' }}>
                        {t.dueDate}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          {t.status !== 'IN_PROGRESS' && (
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '0.7rem', padding: '3px 6px' }}
                              onClick={() => onUpdateStatus(t.id, 'IN_PROGRESS')}
                            >
                              <Clock size={10} /> Progress
                            </button>
                          )}
                          {t.status !== 'IN_REVIEW' && (
                            <button
                              className="btn btn-primary"
                              style={{ fontSize: '0.7rem', padding: '3px 6px' }}
                              onClick={() => onUpdateStatus(t.id, 'IN_REVIEW')}
                            >
                              <CheckCircle size={10} /> Review
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TasksView;
