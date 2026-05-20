'use client';

import { useEffect, useState, useCallback } from 'react';
import { Crown, Trash2, Check, Search, KeyRound, X, Loader2 } from 'lucide-react';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1.75rem 2rem', maxWidth: '380px', width: '90%' }}>
        <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>Confirm Remove</h3>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="admin-btn admin-btn-ghost">Cancel</button>
          <button onClick={onConfirm} className="admin-btn admin-btn-danger">Remove</button>
        </div>
      </div>
    </div>
  );
}

function SetPasswordModal({ member, onSave, onCancel, saving }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');

  const handleSave = () => {
    if (!pw || pw.length < 6) { setErr('Password must be at least 6 characters'); return; }
    if (pw !== pw2) { setErr('Passwords do not match'); return; }
    onSave(pw);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1.75rem 2rem', maxWidth: '400px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Set Password — {member.name}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="admin-field-group">
            <label className="admin-label">New Password</label>
            <input className="admin-input" type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(''); }} placeholder="Min. 6 characters" />
          </div>
          <div className="admin-field-group">
            <label className="admin-label">Confirm Password</label>
            <input className="admin-input" type="password" value={pw2} onChange={e => { setPw2(e.target.value); setErr(''); }} placeholder="Repeat password" />
          </div>
          {err && <p style={{ color: '#e05060', fontSize: '0.8rem' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '0.25rem' }}>
            <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={14} />} Set Password
            </button>
            <button onClick={onCancel} className="admin-btn admin-btn-ghost"><X size={14} /> Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_OPTIONS = ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'];

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [pwModal, setPwModal] = useState(null); // member object

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
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status } : m));
        if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
        showToast('Status updated!');
      } else showToast('Failed', 'error');
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(null); }
  };

  const deleteMember = (member) => {
    setConfirm({
      message: `Remove "${member.name}" from the club? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        setSaving(member.id);
        try {
          const res = await fetch('/api/admin/members', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: member.id }),
          });
          if (res.ok) {
            setMembers(prev => prev.filter(m => m.id !== member.id));
            if (selected?.id === member.id) setSelected(null);
            showToast('Member removed!');
          } else showToast('Failed', 'error');
        } catch { showToast('Failed', 'error'); }
        finally { setSaving(null); }
      },
    });
  };

  const setPassword = async (password) => {
    if (!pwModal) return;
    setSaving(pwModal.id);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setPassword', id: pwModal.id, password }),
      });
      if (res.ok) { showToast('Password updated!'); setPwModal(null); }
      else showToast('Failed to update password', 'error');
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(null); }
  };

  // Filter + search
  const q = search.trim().toLowerCase();
  const filtered = members
    .filter(m => filter === 'all' || m.status === filter.toUpperCase())
    .filter(m => !q || m.name.toLowerCase().includes(q) || m.phone.includes(q) || (m.email || '').toLowerCase().includes(q));

  const counts = {
    all: members.length,
    pending: members.filter(m => m.status === 'PENDING').length,
    active: members.filter(m => m.status === 'ACTIVE').length,
    rejected: members.filter(m => m.status === 'REJECTED').length,
    suspended: members.filter(m => m.status === 'SUSPENDED').length,
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading members...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {pwModal && <SetPasswordModal member={pwModal} onSave={setPassword} onCancel={() => setPwModal(null)} saving={!!saving} />}

      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Beef Eater Club Members</h1>
          <p className="admin-page-sub">{counts.pending} pending · {counts.active} active members</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by name, phone, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'active', 'suspended', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`admin-btn ${filter === f ? 'admin-btn-primary' : 'admin-btn-ghost'}`} style={{ padding: '7px 14px' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] ?? 0})
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.3fr' : '1fr', gap: '1rem' }}>
        {/* List */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0
            ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>No members found.</p>
            : filtered.map(m => (
              <div
                key={m.id}
                onClick={() => setSelected(selected?.id === m.id ? null : m)}
                style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: selected?.id === m.id ? 'rgba(198,45,57,0.08)' : 'transparent', transition: 'background 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={14} style={{ color: m.status === 'ACTIVE' ? '#c62d39' : 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{m.name}</span>
                  </div>
                  <span className={`admin-badge ${m.status === 'ACTIVE' ? 'admin-badge-green' : m.status === 'REJECTED' || m.status === 'SUSPENDED' ? 'admin-badge-red' : 'admin-badge-gold'}`}>
                    {m.status}
                  </span>
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
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Phone', value: selected.phone },
                { label: 'Email', value: selected.email },
                { label: 'Favorite Beef Cut', value: selected.preference },
                { label: 'Membership ID', value: selected.membershipId },
                { label: 'Points', value: selected.points ?? 0 },
                { label: 'Joined', value: new Date(selected.joinedAt).toLocaleString() },
                { label: 'Last Login', value: selected.lastLoginAt ? new Date(selected.lastLoginAt).toLocaleString() : 'Never' },
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
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Update Status</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    disabled={saving === selected.id || selected.status === s}
                    className={`admin-btn ${selected.status === s ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                    style={{ opacity: selected.status === s ? 1 : 0.7, padding: '7px 14px', fontSize: '0.8rem' }}
                  >
                    {selected.status === s && <Check size={13} />}
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
              <button onClick={() => setPwModal(selected)} className="admin-btn admin-btn-ghost" style={{ fontSize: '0.82rem' }}>
                <KeyRound size={14} /> Set Password
              </button>
              <button onClick={() => deleteMember(selected)} className="admin-btn admin-btn-danger" style={{ fontSize: '0.82rem' }}>
                <Trash2 size={13} /> Remove Member
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
