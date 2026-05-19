'use client';

import { useEffect, useState, useCallback } from 'react';
import { Crown, Trash2, Check } from 'lucide-react';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

const STATUS_OPTIONS = ['pending', 'active', 'rejected'];

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/members');
    const json = await res.json();
    setMembers((json.members || []).reverse());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id, status) => {
    setSaving(id);
    try {
      const res = await fetch('/api/admin/members', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status } : m));
        if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
        showToast('Status updated!');
      } else showToast('Failed', 'error');
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(null); }
  };

  const deleteMember = async (id) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await fetch('/api/admin/members', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
        if (selected?.id === id) setSelected(null);
        showToast('Member removed!');
      } else showToast('Failed', 'error');
    } catch { showToast('Failed', 'error'); }
  };

  const filtered = filter === 'all' ? members : members.filter(m => m.status === filter);
  const counts = { all: members.length, pending: members.filter(m => m.status === 'pending').length, active: members.filter(m => m.status === 'active').length, rejected: members.filter(m => m.status === 'rejected').length };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading members...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Beef Eater Club Members</h1>
          <p className="admin-page-sub">{counts.pending} pending · {counts.active} active members</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'active', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`admin-btn ${filter === f ? 'admin-btn-primary' : 'admin-btn-ghost'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.3fr' : '1fr', gap: '1rem' }}>
        {/* List */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0
            ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>No members in this category.</p>
            : filtered.map(m => (
              <div
                key={m.id}
                onClick={() => setSelected(selected?.id === m.id ? null : m)}
                style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: selected?.id === m.id ? 'rgba(198,45,57,0.08)' : 'transparent', transition: 'background 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={14} style={{ color: m.status === 'active' ? '#c62d39' : 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{m.name}</span>
                  </div>
                  <span className={`admin-badge ${m.status === 'active' ? 'admin-badge-green' : m.status === 'rejected' ? 'admin-badge-red' : 'admin-badge-gold'}`}>{m.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{m.phone} · {m.preference}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{new Date(m.joinedAt).toLocaleDateString()}</div>
              </div>
            ))
          }
        </div>

        {/* Detail */}
        {selected && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{selected.name}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Phone', value: selected.phone },
                { label: 'Email', value: selected.email },
                { label: 'Favorite Beef Cut', value: selected.preference },
                { label: 'Joined', value: new Date(selected.joinedAt).toLocaleString() },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>{f.label}</div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>{f.value || '—'}</div>
                </div>
              ))}
              {selected.reason && (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Why they want to join</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>{selected.reason}</div>
                </div>
              )}
            </div>

            {/* Status buttons */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Update Status</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    disabled={saving === selected.id || selected.status === s}
                    className={`admin-btn ${selected.status === s ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                    style={{ opacity: selected.status === s ? 1 : 0.7 }}
                  >
                    {selected.status === s && <Check size={13} />}
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
                <button onClick={() => deleteMember(selected.id)} className="admin-btn admin-btn-danger"><Trash2 size={13} /> Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
