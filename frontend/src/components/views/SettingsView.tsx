import React from 'react';
import { Server, Radio, Palette } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Settings & System Telemetry</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage workspace parameters, API endpoints, and real-time socket connections.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Backend Endpoint Settings */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={16} style={{ color: '#4338CA' }} /> REST API Connection
          </h3>
          <div>
            <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)' }}>API Base Endpoint</label>
            <input
              type="text"
              readOnly
              value="http://localhost:5000/api"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                background: '#FAF9F7',
                marginTop: '4px',
              }}
            />
          </div>
          <span className="status-badge online" style={{ fontSize: '0.7rem', width: 'fit-content' }}>
            Status: Operational
          </span>
        </div>

        {/* Real-time WebSocket Settings */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} style={{ color: '#059669' }} /> WebSocket Telemetry Server
          </h3>
          <div>
            <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Socket Server URI</label>
            <input
              type="text"
              readOnly
              value="ws://localhost:5000"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                background: '#FAF9F7',
                marginTop: '4px',
              }}
            />
          </div>
          <span className="status-badge online" style={{ fontSize: '0.7rem', width: 'fit-content' }}>
            Broadcasting Active
          </span>
        </div>

        {/* Theme Specification */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={16} style={{ color: '#D97706' }} /> Theme Tokens
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span>Page Background: <strong>#F8F8F6</strong> (Warm Off-white)</span>
            <span>Surfaces: <strong>#FFFFFF</strong> (Pure White)</span>
            <span>Accent Color: <strong>#4338CA</strong> (Indigo 700)</span>
            <span>Radius Standard: <strong>12px – 14px</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
