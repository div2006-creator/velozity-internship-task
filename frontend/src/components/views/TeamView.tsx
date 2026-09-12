import React from 'react';

export const TeamView: React.FC = () => {
  const teamMembers = [
    { id: 'u1', name: 'Sarah Jenkins', email: 'admin@organization.com', role: 'ADMIN', status: 'Online', assignedTasks: 0 },
    { id: 'u2', name: 'Ravi Sharma', email: 'ravi.pm@organization.com', role: 'PROJECT_MANAGER', status: 'Online', assignedTasks: 4 },
    { id: 'u3', name: 'Ananya Verma', email: 'ananya.pm@organization.com', role: 'PROJECT_MANAGER', status: 'Online', assignedTasks: 2 },
    { id: 'u4', name: 'Dev User 1', email: 'dev1@organization.com', role: 'DEVELOPER', status: 'Online', assignedTasks: 3 },
    { id: 'u5', name: 'Dev User 2', email: 'dev2@organization.com', role: 'DEVELOPER', status: 'Online', assignedTasks: 2 },
    { id: 'u6', name: 'Dev User 3', email: 'dev3@organization.com', role: 'DEVELOPER', status: 'Offline', assignedTasks: 1 },
    { id: 'u7', name: 'Dev User 4', email: 'dev4@organization.com', role: 'DEVELOPER', status: 'Offline', assignedTasks: 1 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Team Members & Role Allocation</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Admin restricted overview of 1 Admin, 2 Project Managers, and 4 Developers.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Member Name</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Email Address</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Assigned Role</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '8px 6px', fontWeight: 600, textAlign: 'right' }}>Active Tasks</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m) => {
                const isOnline = m.status === 'Online';
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 6px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {m.name}
                    </td>
                    <td style={{ padding: '10px 6px', color: 'var(--text-secondary)' }}>
                      {m.email}
                    </td>
                    <td style={{ padding: '10px 6px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: m.role === 'ADMIN' ? '#EEF2FF' : m.role === 'PROJECT_MANAGER' ? '#FFFBEB' : '#ECFDF5',
                          color: m.role === 'ADMIN' ? '#4338CA' : m.role === 'PROJECT_MANAGER' ? '#D97706' : '#059669',
                          border: m.role === 'ADMIN' ? '1px solid #C7D2FE' : m.role === 'PROJECT_MANAGER' ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                        }}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 6px' }}>
                      <span className={`status-badge ${isOnline ? 'online' : 'offline'}`} style={{ fontSize: '0.7rem' }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {m.assignedTasks}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
