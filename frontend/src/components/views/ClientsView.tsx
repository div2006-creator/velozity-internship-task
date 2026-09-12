import React from 'react';
import { Mail, Phone, Briefcase } from 'lucide-react';

export const ClientsView: React.FC = () => {
  const clients = [
    { id: 'c1', name: 'Acme Corp', company: 'Acme Technologies', email: 'contact@acme.tech', phone: '+1 (555) 234-5678', activeProjects: 2, status: 'Active' },
    { id: 'c2', name: 'Starlight Inc', company: 'Starlight Logistics', email: 'hello@starlight.logistics', phone: '+1 (555) 876-5432', activeProjects: 1, status: 'Active' },
    { id: 'c3', name: 'Enterprise Core', company: 'Enterprise Systems', email: 'support@enterprisecore.com', phone: '+1 (555) 432-1098', activeProjects: 1, status: 'Active' },
    { id: 'c4', name: 'Global Express', company: 'Global Logistics', email: 'info@globalexpress.net', phone: '+1 (555) 987-6543', activeProjects: 1, status: 'Completed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Clients Management</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Admin restricted directory of organization client relationships and project allocations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {clients.map((c) => (
          <div key={c.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.company}</span>
              </div>
              <span className="status-badge online" style={{ fontSize: '0.7rem' }}>
                {c.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={12} style={{ color: '#4338CA' }} /> {c.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={12} style={{ color: '#059669' }} /> {c.phone}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={12} style={{ color: '#D97706' }} /> {c.activeProjects} Active Projects
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsView;
