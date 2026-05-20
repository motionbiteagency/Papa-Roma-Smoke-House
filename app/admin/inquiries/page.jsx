'use client';

import { useEffect, useState, useCallback } from 'react';
import { Mail, Trash2 } from 'lucide-react';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1.75rem 2rem', maxWidth: '380px', width: '90%' }}>
        <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>Delete Inquiry</h3>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="admin-btn admin-btn-ghost">Cancel</button>
          <button onClick={onConfirm} className="admin-btn admin-btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/inquiries');
    const json = await res.json();
    setInquiries((json.inquiries || []).reverse());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markRead = async (inq) => {
    if (inq.read) return;
    // Optimistic update
    setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, read: true } : i));
    setSelected(prev => prev?.id === inq.id ? { ...prev, read: true } : prev);
    // Persist to file
    await fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: inq.id, read: true }),
    });
  };

  const deleteInquiry = (inq) => {
    setConfirm({
      message: `Delete inquiry from "${inq.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await fetch('/api/inquiries', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: inq.id }),
          });
          if (res.ok) {
            setInquiries(prev => prev.filter(i => i.id !== inq.id));
            if (selected?.id === inq.id) setSelected(null);
            showToast('Inquiry deleted');
          } else showToast('Failed to delete', 'error');
        } catch { showToast('Failed', 'error'); }
      },
    });
  };

  const filtered = filter === 'unread' ? inquiries.filter(i => !i.read) : inquiries;
  const unreadCount = inquiries.filter(i => !i.read).length;

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading inquiries...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Inquiries</h1>
          <p className="admin-page-sub">{unreadCount} unread · {inquiries.length} total</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'unread'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`admin-btn ${filter === f ? 'admin-btn-primary' : 'admin-btn-ghost'}`}>
              {f === 'all' ? `All (${inquiries.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.3fr' : '1fr', gap: '1rem' }}>
        {/* List */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0
            ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>No {filter === 'unread' ? 'unread ' : ''}inquiries.</p>
            : filtered.map(inq => (
              <div
                key={inq.id}
                onClick={() => { setSelected(inq); markRead(inq); }}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  background: selected?.id === inq.id ? 'rgba(198,45,57,0.08)' : inq.read ? 'transparent' : 'rgba(255,255,255,0.02)',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontWeight: inq.read ? 500 : 700, color: inq.read ? 'rgba(255,255,255,0.55)' : '#fff', fontSize: '0.9rem' }}>{inq.name}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {!inq.read && <span className="admin-badge admin-badge-red">New</span>}
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{inq.email}</div>
                {inq.eventType && <div style={{ fontSize: '0.78rem', color: '#c62d39', marginTop: '3px' }}>{inq.eventType}</div>}
              </div>
            ))
          }
        </div>

        {/* Detail View */}
        {selected && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{selected.name}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Email', value: selected.email },
                { label: 'Phone', value: selected.phone || '—' },
                { label: 'Event Type', value: selected.eventType || '—' },
                { label: 'Submitted', value: new Date(selected.createdAt).toLocaleString() },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>{f.label}</div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>{f.value}</div>
                </div>
              ))}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Message</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.7, background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {selected.message}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <a href={`mailto:${selected.email}?subject=Re: Your Inquiry — Papa Roma`} className="admin-btn admin-btn-primary" style={{ textDecoration: 'none', justifyContent: 'center', flex: 1 }}>
                  <Mail size={14} /> Reply via Email
                </a>
                <button onClick={() => deleteInquiry(selected)} className="admin-btn admin-btn-danger" style={{ padding: '9px 14px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
