'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Pencil, Check, X, Loader2 } from 'lucide-react';

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

const EMPTY = { title: '', description: '', code: '', discount: '', startDate: '', endDate: '', active: true };

function toInputDate(val) {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}

async function apiCall(action, data) {
  const res = await fetch('/api/admin/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed'); }
  return res.json();
}

function OfferForm({ title: formTitle, initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));
  return (
    <div className="admin-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(198,45,57,0.3)' }}>
      <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>{formTitle}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="admin-field-group"><label className="admin-label">Title *</label><input className="admin-input" value={form.title} onChange={f('title')} placeholder="e.g. Grand Opening Special" /></div>
        <div className="admin-field-group"><label className="admin-label">Promo Code</label><input className="admin-input" value={form.code} onChange={f('code')} placeholder="e.g. WELCOME15" /></div>
        <div className="admin-field-group"><label className="admin-label">Discount %</label><input className="admin-input" type="number" value={form.discount} onChange={f('discount')} placeholder="15" /></div>
        <div className="admin-field-group"><label className="admin-label">Start Date</label><input className="admin-input" type="date" value={form.startDate} onChange={f('startDate')} /></div>
        <div className="admin-field-group"><label className="admin-label">End Date</label><input className="admin-input" type="date" value={form.endDate} onChange={f('endDate')} /></div>
        <div className="admin-field-group" style={{ gridColumn: '1/-1' }}>
          <label className="admin-label">Description</label>
          <textarea className="admin-input" rows={2} value={form.description} onChange={f('description')} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ gridColumn: '1/-1', display: 'flex', gap: '8px' }}>
          <button onClick={() => onSave(form)} className="admin-btn admin-btn-primary" disabled={saving}><Check size={14} /> Save Offer</button>
          <button onClick={onCancel} className="admin-btn admin-btn-ghost"><X size={14} /> Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editOffer, setEditOffer] = useState(null); // the offer being edited
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/offers');
    const json = await res.json();
    setOffers(json.offers || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const withSaving = async (fn) => {
    setSaving(true);
    try { await fn(); } catch (e) { showToast(e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const addOffer = (form) => {
    if (!form.title.trim()) { showToast('Title is required', 'error'); return; }
    withSaving(async () => {
      const result = await apiCall('create', { ...form, discount: parseFloat(form.discount) || 0 });
      setOffers(prev => [result.offer, ...prev]);
      showToast('Offer created!');
      setShowAdd(false);
    });
  };

  const updateOffer = (form) => {
    if (!form.title.trim()) { showToast('Title is required', 'error'); return; }
    withSaving(async () => {
      await apiCall('update', { id: editOffer.id, ...form, discount: parseFloat(form.discount) || 0 });
      setOffers(prev => prev.map(o => o.id === editOffer.id ? { ...o, ...form, discount: parseFloat(form.discount) || 0 } : o));
      showToast('Offer updated!');
      setEditOffer(null);
    });
  };

  const toggleActive = (offer) => {
    withSaving(async () => {
      await apiCall('toggle', { id: offer.id, active: !offer.active });
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, active: !o.active } : o));
    });
  };

  const deleteOffer = (offer) => {
    setConfirm({
      message: `Delete "${offer.title}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        await withSaving(async () => {
          await apiCall('delete', { id: offer.id });
          setOffers(prev => prev.filter(o => o.id !== offer.id));
          showToast('Offer deleted');
        });
      },
    });
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading offers...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Offers & Promotions</h1>
          <p className="admin-page-sub">Manage discount codes and promotional offers.</p>
        </div>
        <button onClick={() => { setShowAdd(v => !v); setEditOffer(null); }} className="admin-btn admin-btn-primary">
          <Plus size={15} /> {showAdd ? 'Cancel' : 'Add Offer'}
        </button>
      </div>

      {showAdd && !editOffer && (
        <OfferForm title="New Offer" initial={EMPTY} onSave={addOffer} onCancel={() => setShowAdd(false)} saving={saving} />
      )}

      {editOffer && (
        <OfferForm
          title="Edit Offer"
          initial={{ title: editOffer.title, description: editOffer.description || '', code: editOffer.code || '', discount: editOffer.discount || '', startDate: toInputDate(editOffer.startDate), endDate: toInputDate(editOffer.endDate), active: editOffer.active }}
          onSave={updateOffer}
          onCancel={() => setEditOffer(null)}
          saving={saving}
        />
      )}

      <div className="admin-card">
        {offers.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>No offers yet. Add your first one!</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Offer</th><th>Code</th><th>Discount</th><th>Dates</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{offer.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{offer.description}</div>
                  </td>
                  <td>{offer.code ? <span className="admin-badge admin-badge-gold">{offer.code}</span> : <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>}</td>
                  <td style={{ fontWeight: 700, color: '#22c55e' }}>{offer.discount > 0 ? `${offer.discount}%` : '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                    {offer.startDate && <div>{toInputDate(offer.startDate)}</div>}
                    {offer.endDate && <div>→ {toInputDate(offer.endDate)}</div>}
                  </td>
                  <td>
                    <button onClick={() => toggleActive(offer)} className={`admin-badge ${offer.active ? 'admin-badge-green' : 'admin-badge-gray'}`} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {offer.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setEditOffer(offer); setShowAdd(false); }} className="admin-btn admin-btn-ghost" style={{ padding: '6px 10px' }}><Pencil size={13} /></button>
                      <button onClick={() => deleteOffer(offer)} className="admin-btn admin-btn-danger" style={{ padding: '6px 10px' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
