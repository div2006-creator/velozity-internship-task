import React, { useState } from 'react';
import { X, PlusCircle, Calendar, AlertTriangle, Layers, User } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: {
    title: string;
    description: string;
    projectId: string;
    priority: string;
    status: string;
    assignedDeveloperId?: string;
    dueDate?: string;
  }) => Promise<void> | void;
  projects?: Array<{ id: string; name: string }>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  projects = [
    { id: 'proj-1', name: 'Client Portal Dashboard' },
    { id: 'proj-2', name: 'Mobile App Redesign' },
    { id: 'proj-3', name: 'Database Migration' },
  ],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || 'proj-1');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [assignedDeveloperId, setAssignedDeveloperId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateTask({
        title,
        description,
        projectId,
        priority,
        status,
        assignedDeveloperId: assignedDeveloperId || undefined,
        dueDate: dueDate || undefined,
      });

      // Reset Form
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setAssignedDeveloperId('');
      setDueDate('');
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2rem',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4338CA',
              }}
            >
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create New Task</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Add a new task to your project workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Task Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Task Title <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Implement OAuth Authorization Flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-family)',
                color: 'var(--text-primary)',
                background: '#FAF9F6',
                outline: 'none',
              }}
            />
          </div>

          {/* Project & Priority Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                <Layers size={14} style={{ color: '#4338CA' }} /> Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--text-primary)',
                  background: '#FAF9F6',
                  outline: 'none',
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                <AlertTriangle size={14} style={{ color: '#D97706' }} /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--text-primary)',
                  background: '#FAF9F6',
                  outline: 'none',
                }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          {/* Status & Developer Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--text-primary)',
                  background: '#FAF9F6',
                  outline: 'none',
                }}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="IN_REVIEW">IN_REVIEW</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                <User size={14} style={{ color: '#059669' }} /> Assigned Developer
              </label>
              <input
                type="text"
                placeholder="Developer Name"
                value={assignedDeveloperId}
                onChange={(e) => setAssignedDeveloperId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--text-primary)',
                  background: '#FAF9F6',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              <Calendar size={14} style={{ color: '#7C3AED' }} /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-family)',
                color: 'var(--text-primary)',
                background: '#FAF9F6',
                outline: 'none',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Detailed task description and requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-family)',
                color: 'var(--text-primary)',
                background: '#FAF9F6',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
