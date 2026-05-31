'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import ImageUploader from '@/app/components/admin/ImageUploader';
import AdminLoading from '@/app/components/admin/AdminLoading';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1.75rem 2rem', maxWidth: '380px', width: '90%' }}>
        <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>Confirm Delete</h3>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="admin-btn admin-btn-ghost">Cancel</button>
          <button onClick={onConfirm} className="admin-btn admin-btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY = { name: '', comment: '', rating: 5, image: '' };

async function apiCall(action, data) {
  const res = await fetch('/api/admin/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
  return res.json();
}

function TestimonialForm({ title: formTitle, initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  return (
    <div className="admin-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(198,45,57,0.3)' }}>
      <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>{formTitle}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="admin-field-group">
          <label className="admin-label">Customer Name *</label>
          <input className="admin-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="admin-field-group">
          <label className="admin-label">Rating (1–5)</label>
          <input className="admin-input" type="number" min={1} max={5} value={form.rating} onChange={e => setForm(p => ({ ...p, rating: parseInt(e.target.value) || 5 }))} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <ImageUploader
            label="Customer Photo (optional)"
            value={form.image}
            onChange={(url) => setForm(p => ({ ...p, image: url }))}
            size="md"
            aspect="1 / 1"
            hint="Square photo works best for the avatar. Optional."
          />
        </div>
        <div className="admin-field-group" style={{ gridColumn: '1/-1' }}>
          <label className="admin-label">Review *</label>
          <textarea className="admin-input" rows={3} value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ gridColumn: '1/-1', display: 'flex', gap: '8px' }}>
          <button onClick={() => onSave(form)} className="admin-btn admin-btn-primary" disabled={saving}><Check size={14} /> Save</button>
          <button onClick={onCancel} className="admin-btn admin-btn-ghost"><X size={14} /> Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/testimonials');
    const json = await res.json();
    setTestimonials(json.testimonials || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const withSaving = async (fn) => {
    setSaving(true);
    try { await fn(); } catch (e) { showToast(e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const addTestimonial = (form) => {
    if (!form.name.trim() || !form.comment.trim()) { showToast('Name and review are required', 'error'); return; }
    withSaving(async () => {
      const result = await apiCall('create', form);
      setTestimonials(prev => [result.testimonial, ...prev]);
      showToast('Review added!');
      setShowAdd(false);
    });
  };

  const updateTestimonial = (form) => {
    if (!form.name.trim() || !form.comment.trim()) { showToast('Name and review are required', 'error'); return; }
    withSaving(async () => {
      await apiCall('update', { id: editItem.id, ...form });
      setTestimonials(prev => prev.map(t => t.id === editItem.id ? { ...t, ...form } : t));
      showToast('Review updated!');
      setEditItem(null);
    });
  };

  const toggleActive = (t) => {
    withSaving(async () => {
      await apiCall('toggle', { id: t.id, active: !t.active });
      setTestimonials(prev => prev.map(item => item.id === t.id ? { ...item, active: !item.active } : item));
    });
  };

  const deleteTestimonial = (t) => {
    setConfirm({
      message: `Delete review by "${t.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        await withSaving(async () => {
          await apiCall('delete', { id: t.id });
          setTestimonials(prev => prev.filter(item => item.id !== t.id));
          showToast('Review deleted');
        });
      },
    });
  };

  if (loading) return <AdminLoading text="Loading testimonials..." />;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Testimonials</h1>
          <p className="admin-page-sub">{testimonials.filter(t => t.active).length} active reviews shown on homepage.</p>
        </div>
        <button onClick={() => { setShowAdd(v => !v); setEditItem(null); }} className="admin-btn admin-btn-primary">
          <Plus size={14} /> Add Review
        </button>
      </div>

      {showAdd && !editItem && (
        <TestimonialForm title="New Testimonial" initial={EMPTY} onSave={addTestimonial} onCancel={() => setShowAdd(false)} saving={saving} />
      )}

      {editItem && (
        <TestimonialForm
          title="Edit Review"
          initial={{ name: editItem.name, comment: editItem.comment, rating: editItem.rating, image: editItem.image || '' }}
          onSave={updateTestimonial}
          onCancel={() => setEditItem(null)}
          saving={saving}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {testimonials.length === 0 && (
          <div className="admin-card" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem' }}>No reviews yet.</div>
        )}
        {testimonials.map((t) => (
          <div key={t.id} className="admin-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: t.active ? 1 : 0.5 }}>
            {t.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={t.image} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>{t.name}</span>
                <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>{'★'.repeat(t.rating)}</span>
                <span className={`admin-badge ${t.active ? 'admin-badge-green' : 'admin-badge-gray'}`}>{t.active ? 'Visible' : 'Hidden'}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>{t.comment}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={() => { setEditItem(t); setShowAdd(false); }} className="admin-btn admin-btn-ghost" style={{ padding: '6px 10px' }}><Pencil size={13} /></button>
              <button onClick={() => toggleActive(t)} className="admin-btn admin-btn-ghost" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>{t.active ? 'Hide' : 'Show'}</button>
              <button onClick={() => deleteTestimonial(t)} className="admin-btn admin-btn-danger" style={{ padding: '6px 10px' }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
