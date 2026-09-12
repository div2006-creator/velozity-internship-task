import React from 'react';
import { PlusCircle, Building2 } from 'lucide-react';

interface ProjectsViewProps {
  onCreateTaskClick: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onCreateTaskClick }) => {
  const projects = [
    { id: 'proj-1', name: 'Client Portal', client: 'Acme Corp', company: 'Acme Technologies', status: 'In Progress', tasksCount: 18, owner: 'Sarah Jenkins (PM)' },
    { id: 'proj-2', name: 'Mobile App Redesign', client: 'Starlight Inc', company: 'Starlight Logistics', status: 'In Progress', tasksCount: 14, owner: 'Ravi Sharma (PM)' },
    { id: 'proj-3', name: 'API Platform', client: 'Enterprise Core', company: 'Enterprise Systems', status: 'To Do', tasksCount: 9, owner: 'Ananya Verma (PM)' },
    { id: 'proj-4', name: 'Database Migration', client: 'Global Logistics', company: 'Global Express', status: 'Done', tasksCount: 15, owner: 'Sarah Jenkins (PM)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Projects</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage all client project repositories and delivery timelines.</p>
        </div>
        <button className="btn btn-primary" onClick={onCreateTaskClick} style={{ fontSize: '0.8rem' }}>
          <PlusCircle size={14} /> New Task
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {projects.map((p) => (
          <div key={p.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Building2 size={12} /> {p.company}
                </span>
              </div>
              <span className="status-badge online" style={{ fontSize: '0.7rem' }}>
                {p.status}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Owner: <strong style={{ color: 'var(--text-primary)' }}>{p.owner}</strong></span>
              <span className="status-badge warning" style={{ fontSize: '0.7rem' }}>{p.tasksCount} Tasks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsView;
