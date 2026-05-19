'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Star, Check, X } from 'lucide-react';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newT, setNewT] = useState({ name: '', comment: '', rating: 5, image: '', active: true });

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/testimonials');
    const json = await res.json();
    setTestimonials(json.testimonials || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async (updated) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testimonials: updated }) });
      if (res.ok) { setTestimonials(updated); showToast('Saved!'); }
      else showToast('Failed', 'error');
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const toggleActive = (idx) => save(testimonials.map((t, i) => i === idx ? { ...t, active: !t.active } : t));
  const deleteT = (idx) => { if (!confirm('Delete this review?')) return; save(testimonials.filter((_, i) => i !== idx)); };
  const addT = () => {
    if (!newT.name || !newT.comment) { showToast('Name and comment required', 'error'); return; }
    save([...testimonials, { id: `t_${Date.now()}`, ...newT }]);
    setShowAdd(false);
    setNewT({ name: '', comment: '', rating: 5, image: '', active: true });
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Testimonials</h1>
          <p className="admin-page-sub">{testimonials.filter(t => t.active).length} active reviews shown on homepage.</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Review</button>
      </div>

      {showAdd && (
        <div className="admin-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(198,45,57,0.3)' }}>
          <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>New Testimonial</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Customer Name *', key: 'name' },
              { label: 'Rating (1-5)', key: 'rating', type: 'number' },
              { label: 'Photo URL (optional)', key: 'image', placeholder: 'https://...' },
            ].map(f => (
              <div key={f.key} className="admin-field-group">
                <label className="admin-label">{f.label}</label>
                <input className="admin-input" type={f.type || 'text'} placeholder={f.placeholder} value={newT[f.key]} onChange={e => setNewT(p => ({ ...p, [f.key]: f.type === 'number' ? parseInt(e.target.value) : e.target.value }))} min={1} max={5} />
              </div>
            ))}
            <div className="admin-field-group" style={{ gridColumn: '1/-1' }}>
              <label className="admin-label">Review *</label>
              <textarea className="admin-input" rows={3} value={newT.comment} onChange={e => setNewT(p => ({ ...p, comment: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '8px' }}>
              <button onClick={addT} className="admin-btn admin-btn-primary"><Check size={14} /> Add</button>
              <button onClick={() => setShowAdd(false)} className="admin-btn admin-btn-ghost"><X size={14} /> Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {testimonials.map((t, idx) => (
          <div key={t.id || idx} className="admin-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: t.active ? 1 : 0.5 }}>
            {t.image && <img src={t.image} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>{t.name}</span>
                <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>{'★'.repeat(t.rating)}</span>
                <span className={`admin-badge ${t.active ? 'admin-badge-green' : 'admin-badge-gray'}`}>{t.active ? 'Visible' : 'Hidden'}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>{t.comment}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={() => toggleActive(idx)} className="admin-btn admin-btn-ghost" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>{t.active ? 'Hide' : 'Show'}</button>
              <button onClick={() => deleteT(idx)} className="admin-btn admin-btn-danger" style={{ padding: '6px 10px' }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
