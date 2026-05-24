'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, Check, RefreshCw } from 'lucide-react';
import AdminLoading from '@/app/components/admin/AdminLoading';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

const STATUS_COLORS = {
  PENDING:   'admin-badge-gold',
  CONFIRMED: 'admin-badge-green',
  REJECTED:  'admin-badge-red',
  COMPLETED: 'admin-badge-gray',
};

const STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED'];

export default function AdminEventsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/events');
      const json = await res.json();
      setBookings(json.bookings || []);
    } catch { showToast('Failed to load bookings', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = (b) => {
    setSelected(b);
    setNote(b.adminNote || '');
  };

  const updateStatus = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', data: { id: selected.id, status, adminNote: note } }),
      });
      if (res.ok) {
        const updated = { ...selected, status, adminNote: note };
        setBookings(prev => prev.map(b => b.id === selected.id ? updated : b));
        setSelected(updated);
        showToast('Status updated!');
      } else showToast('Failed to update', 'error');
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const counts = {
    all: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Event Bookings</h1>
          <p className="admin-page-sub">{counts.PENDING} pending · {counts.all} total bookings</p>
        </div>
        <button onClick={fetchData} className="admin-btn admin-btn-ghost" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} className={`admin-btn ${filter === 'all' ? 'admin-btn-primary' : 'admin-btn-ghost'}`} style={{ padding: '7px 14px' }}>
          All ({counts.all})
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`admin-btn ${filter === s ? 'admin-btn-primary' : 'admin-btn-ghost'}`} style={{ padding: '7px 14px' }}>
            {s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
          </button>
        ))}
      </div>

      {loading ? (
        <AdminLoading text="Loading bookings..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.4fr' : '1fr', gap: '1rem' }}>
          {/* List */}
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2.5rem' }}>No {filter !== 'all' ? filter.toLowerCase() : ''} bookings.</p>
            ) : (
              filtered.map(b => (
                <div
                  key={b.id}
                  onClick={() => openDetail(b)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    background: selected?.id === b.id ? 'rgba(198,45,57,0.08)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{b.name}</span>
                    <span className={`admin-badge ${STATUS_COLORS[b.status] || 'admin-badge-gray'}`}>{b.status}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '3px' }}>
                    <span style={{ color: '#c62d39' }}>{b.eventType}</span> · {b.guests} guests
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                      <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                      {new Date(b.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
                      Received {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail */}
          {selected && (
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem', marginBottom: '4px' }}>{selected.name}</h2>
                  <span className={`admin-badge ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone },
                  { label: 'Event Type', value: selected.eventType },
                  { label: 'Event Date', value: new Date(selected.eventDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Guests', value: `${selected.guests} people` },
                  { label: 'Submitted', value: new Date(selected.createdAt).toLocaleString() },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>{f.label}</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{f.value}</div>
                  </div>
                ))}
                {selected.instructions && (
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Special Instructions</div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>{selected.instructions}</div>
                  </div>
                )}
              </div>

              {/* Admin note */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Admin Note (optional)</div>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note visible only to admins…"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Status update buttons */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Update Status</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(s)}
                      disabled={saving || selected.status === s}
                      className={`admin-btn ${selected.status === s ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                      style={{ opacity: selected.status === s ? 1 : 0.7, padding: '7px 14px', fontSize: '0.82rem' }}
                    >
                      {selected.status === s && <Check size={13} />}
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick reply */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <a
                  href={`mailto:${selected.email}?subject=Your Event Booking — Papa Roma Smoke House&body=Dear ${selected.name},%0A%0A`}
                  className="admin-btn admin-btn-ghost"
                  style={{ textDecoration: 'none', fontSize: '0.82rem' }}
                >
                  ✉ Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      <style>{`.spinning { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
