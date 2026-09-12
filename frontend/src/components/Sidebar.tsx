import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Activity,
  Bell,
  Users,
  Building2,
  Settings,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
  unreadNotificationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  unreadNotificationCount = 3,
}) => {
  const isAdmin = userRole === 'ADMIN';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'activity', label: 'Activity', icon: Activity },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
    },
  ];

  const adminItems = [
    { id: 'clients', label: 'Clients', icon: Building2, adminOnly: true },
    { id: 'team', label: 'Team', icon: Users, adminOnly: true },
  ];

  return (
    <aside className="sidebar-container">
      {/* Brand Header */}
      <div style={{ paddingBottom: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#4338CA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>
          CP
        </div>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Client Projects</h2>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>SaaS Workspace</span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#EEF2FF' : 'transparent',
                color: isActive ? '#4338CA' : 'var(--text-primary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} style={{ color: isActive ? '#4338CA' : 'var(--text-secondary)' }} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  style={{
                    background: '#4338CA',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    lineHeight: 1,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Role-Restricted Admin Section */}
        {isAdmin && (
          <>
            <div style={{ margin: '1rem 0 0.5rem 0', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Admin Tools
              </span>
              <ShieldAlert size={12} style={{ color: '#4338CA' }} />
            </div>

            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#EEF2FF' : 'transparent',
                    color: isActive ? '#4338CA' : 'var(--text-primary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? '#4338CA' : 'var(--text-secondary)' }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer Settings Link */}
      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'settings' ? '#EEF2FF' : 'transparent',
            color: activeTab === 'settings' ? '#4338CA' : 'var(--text-primary)',
            fontWeight: activeTab === 'settings' ? 600 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Settings size={18} style={{ color: activeTab === 'settings' ? '#4338CA' : 'var(--text-secondary)' }} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
