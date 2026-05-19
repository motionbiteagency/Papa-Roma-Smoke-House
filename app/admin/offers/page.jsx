'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Check, X, Loader2 } from 'lucide-react';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', code: '', discount: '', startDate: '', endDate: '', active: true, bannerImage: null });

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/offers');
    const json = await res.json();
    setOffers(json.offers || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async (updatedOffers) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offers: updatedOffers }) });
      if (res.ok) { setOffers(updatedOffers); showToast('Saved!'); }
      else showToast('Failed to save', 'error');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const toggleActive = (idx) => {
    const updated = offers.map((o, i) => i === idx ? { ...o, active: !o.active } : o);
    save(updated);
  };

  const deleteOffer = (idx) => {
    if (!confirm('Delete this offer?')) return;
    save(offers.filter((_, i) => i !== idx));
  };

  const addOffer = () => {
    if (!newOffer.title) { showToast('Title is required', 'error'); return; }
    const offer = { ...newOffer, id: `o_${Date.now()}`, discount: parseFloat(newOffer.discount) || 0 };
    save([...offers, offer]);
    setShowAdd(false);
    setNewOffer({ title: '', description: '', code: '', discount: '', startDate: '', endDate: '', active: true, bannerImage: null });
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading offers...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Offers & Promotions</h1>
          <p className="admin-page-sub">Manage discount codes and promotional offers.</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="admin-btn admin-btn-primary">
          <Plus size={15} /> {showAdd ? 'Cancel' : 'Add Offer'}
        </button>
      </div>

      {showAdd && (
        <div className="admin-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(198,45,57,0.3)' }}>
          <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>New Offer</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Title *', key: 'title', type: 'text', placeholder: 'e.g. Grand Opening Special' },
              { label: 'Promo Code', key: 'code', type: 'text', placeholder: 'e.g. WELCOME15' },
              { label: 'Discount %', key: 'discount', type: 'number', placeholder: '15' },
              { label: 'Start Date', key: 'startDate', type: 'date' },
              { label: 'End Date', key: 'endDate', type: 'date' },
            ].map(f => (
              <div key={f.key} className="admin-field-group">
                <label className="admin-label">{f.label}</label>
                <input className="admin-input" type={f.type} placeholder={f.placeholder} value={newOffer[f.key]} onChange={e => setNewOffer(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="admin-field-group" style={{ gridColumn: '1/-1' }}>
              <label className="admin-label">Description</label>
              <textarea className="admin-input" rows={2} value={newOffer.description} onChange={e => setNewOffer(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '8px' }}>
              <button onClick={addOffer} className="admin-btn admin-btn-primary" disabled={saving}><Check size={14} /> Save Offer</button>
              <button onClick={() => setShowAdd(false)} className="admin-btn admin-btn-ghost"><X size={14} /> Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        {offers.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>No offers yet. Add your first one!</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Offer</th>
                <th>Code</th>
                <th>Discount</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer, idx) => (
                <tr key={offer.id || idx}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{offer.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{offer.description}</div>
                  </td>
                  <td>
                    {offer.code
                      ? <span className="admin-badge admin-badge-gold">{offer.code}</span>
                      : <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
                    }
                  </td>
                  <td style={{ fontWeight: 700, color: '#22c55e' }}>{offer.discount > 0 ? `${offer.discount}%` : '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                    {offer.startDate && <div>{offer.startDate}</div>}
                    {offer.endDate && <div>→ {offer.endDate}</div>}
                  </td>
                  <td>
                    <button onClick={() => toggleActive(idx)} className={`admin-badge ${offer.active ? 'admin-badge-green' : 'admin-badge-gray'}`} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {offer.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => deleteOffer(idx)} className="admin-btn admin-btn-danger" style={{ padding: '6px 10px' }}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
