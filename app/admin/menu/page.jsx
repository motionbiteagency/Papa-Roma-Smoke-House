'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Pencil, X, ChevronDown, ChevronRight, Star, Loader2, Check } from 'lucide-react';
import ImageUploader from '@/app/components/admin/ImageUploader';
import { getItemImage } from '@/data/itemImages';

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

/* ─── Confirm delete modal ───────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

/* ─── Add / Edit item modal ──────────────────────────────── */
function ItemModal({ mode, item, catName, onSave, onClose, saving }) {
  const [form, setForm] = useState(
    item ?? { name: '', nameBn: '', description: '', price: '', unit: '', imageUrl: '', featured: false }
  );
  const [uploading, setUploading] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const canSave = !saving && !uploading && form.name.trim() && form.price;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
              {mode === 'add' ? 'Add New Item' : 'Edit Item'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', margin: '2px 0 0' }}>{catName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1.5rem' }}>
          {/* Left — image uploader */}
          <div>
            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Item Image</label>
            <ImageUploader
              value={form.imageUrl || ''}
              onChange={url => set('imageUrl', url)}
              onUploadStart={() => setUploading(true)}
              onUploadEnd={() => setUploading(false)}
              size="lg"
              aspect="1 / 1"
              hint="JPG, PNG or WEBP · max 5 MB"
            />
            {uploading && (
              <p style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> Uploading… save when done
              </p>
            )}
          </div>

          {/* Right — fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="admin-field-group">
              <label className="admin-label">Name <span style={{ color: '#c62d39' }}>*</span></label>
              <input className="admin-input" placeholder="e.g. Beef Brisket" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="admin-field-group">
              <label className="admin-label">Bangla Name</label>
              <input className="admin-input" placeholder="বাংলা নাম" value={form.nameBn || ''} onChange={e => set('nameBn', e.target.value)} />
            </div>
            <div className="admin-field-group">
              <label className="admin-label">Description</label>
              <textarea className="admin-input" placeholder="Short description shown on menu page…" value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="admin-field-group">
                <label className="admin-label">Price (৳) <span style={{ color: '#c62d39' }}>*</span></label>
                <input className="admin-input" type="number" placeholder="e.g. 450" value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div className="admin-field-group">
                <label className="admin-label">Unit</label>
                <input className="admin-input" placeholder="e.g. per 100gm" value={form.unit || ''} onChange={e => set('unit', e.target.value)} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={!!form.featured}
                onChange={e => set('featured', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#f59e0b' }}
              />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                Mark as <strong style={{ color: '#f59e0b' }}>Featured</strong> (shows Popular badge)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} className="admin-btn admin-btn-ghost">Cancel</button>
          <button
            onClick={() => onSave(form)}
            className="admin-btn admin-btn-primary"
            disabled={!canSave}
            title={uploading ? 'Wait for image upload to finish' : ''}
          >
            {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</> : <><Check size={14} /> {mode === 'add' ? 'Add Item' : 'Save Changes'}</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── API helper ─────────────────────────────────────────── */
const EMPTY_ITEM = { name: '', nameBn: '', description: '', price: '', unit: '', imageUrl: '', featured: false };

async function apiCall(action, data) {
  const res = await fetch('/api/admin/menus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

/* ─── Main page ──────────────────────────────────────────── */
export default function AdminMenuPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', item, catName, menuIdx, catIdx, catId }
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/menus');
      const json = await res.json();
      setData(json);
      if (json.menuTypes?.length) setExpandedMenu(0);
    } catch { showToast('Failed to load menu', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const withSaving = async (fn) => {
    setSaving(true);
    try { await fn(); }
    catch (e) { showToast(e.message || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const toggleFeatured = (item) => {
    setData(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      for (const mt of clone.menuTypes)
        for (const cat of mt.categories)
          for (const it of cat.items)
            if (it.id === item.id) it.featured = !it.featured;
      return clone;
    });
    withSaving(() => apiCall('toggleFeatured', { id: item.id, featured: !item.featured }));
  };

  const deleteItem = (item) => {
    setConfirm({
      message: `Delete "${item.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        await withSaving(async () => {
          await apiCall('deleteItem', { id: item.id });
          setData(prev => {
            const clone = JSON.parse(JSON.stringify(prev));
            for (const mt of clone.menuTypes)
              for (const cat of mt.categories)
                cat.items = cat.items.filter(i => i.id !== item.id);
            return clone;
          });
          showToast('Item deleted');
        });
      },
    });
  };

  const handleSave = async (form) => {
    if (modal.mode === 'edit') {
      await withSaving(async () => {
        const { id, name, nameBn, description, price, unit, imageUrl, featured } = form;
        await apiCall('updateItem', { id, name, nameBn, description, price: parseFloat(price) || 0, unit, imageUrl: imageUrl || null, featured });
        setData(prev => {
          const clone = JSON.parse(JSON.stringify(prev));
          for (const mt of clone.menuTypes)
            for (const cat of mt.categories)
              for (let i = 0; i < cat.items.length; i++)
                if (cat.items[i].id === id)
                  cat.items[i] = { ...cat.items[i], name, nameBn, description, price: parseFloat(price) || 0, unit, imageUrl: imageUrl || null, featured };
          return clone;
        });
        showToast('Item updated!');
        setModal(null);
      });
    } else {
      const { catId, menuIdx, catIdx } = modal;
      const order = data.menuTypes[menuIdx].categories[catIdx].items.length;
      await withSaving(async () => {
        const result = await apiCall('addItem', {
          categoryId: catId,
          name: form.name.trim(),
          nameBn: form.nameBn || null,
          description: form.description || null,
          price: parseFloat(form.price) || 0,
          unit: form.unit || null,
          imageUrl: form.imageUrl || null,
          featured: form.featured,
          active: true,
          order,
        });
        setData(prev => {
          const clone = JSON.parse(JSON.stringify(prev));
          clone.menuTypes[menuIdx].categories[catIdx].items.push(result.item);
          return clone;
        });
        showToast('Item added!');
        setModal(null);
      });
    }
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading menu data...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {modal && (
        <ItemModal
          mode={modal.mode}
          item={modal.item}
          catName={modal.catName}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      <div className="admin-page-header">
        <h1 className="admin-page-title">Menu Manager</h1>
        <p className="admin-page-sub">Edit items, prices, descriptions and featured status across all 4 menus.</p>
      </div>

      {data?.menuTypes?.map((menu, mIdx) => (
        <div key={menu.id} className="admin-card" style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setExpandedMenu(expandedMenu === mIdx ? null : mIdx)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          >
            <span style={{ fontSize: '1.2rem' }}>{menu.icon}</span>
            <span style={{ flex: 1, fontWeight: 700, fontSize: '1.05rem' }}>{menu.name}</span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
              {menu.categories.reduce((s, c) => s + c.items.length, 0)} items
            </span>
            {expandedMenu === mIdx ? <ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.4)' }} /> : <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />}
          </button>

          {expandedMenu === mIdx && (
            <div style={{ marginTop: '1.25rem' }}>
              {menu.categories.map((cat, cIdx) => {
                const catKey = `${mIdx}-${cIdx}`;
                return (
                  <div key={cat.id} style={{ marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setExpandedCat(expandedCat === catKey ? null : catKey)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{cat.items.length} items</span>
                      {expandedCat === catKey ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>

                    {expandedCat === catKey && (
                      <div style={{ padding: '0.75rem' }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th style={{ width: 66 }}>Image</th>
                              <th>Name</th>
                              <th>Description</th>
                              <th>Price (৳)</th>
                              <th>Unit</th>
                              <th>Featured</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.items.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.imageUrl || getItemImage(item.itemId)}
                                    alt={item.name}
                                    style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', display: 'block', border: '1px solid rgba(255,255,255,0.08)' }}
                                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80'; }}
                                  />
                                </td>
                                <td>
                                  <div style={{ fontWeight: 600, color: '#fff' }}>{item.name}</div>
                                  {item.nameBn && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{item.nameBn}</div>}
                                </td>
                                <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', maxWidth: 180 }}>
                                  {item.description
                                    ? <span title={item.description}>{item.description.length > 60 ? item.description.slice(0, 60) + '…' : item.description}</span>
                                    : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                                </td>
                                <td style={{ fontWeight: 700, color: '#b8913a' }}>৳{item.price}</td>
                                <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{item.unit || '—'}</td>
                                <td>
                                  <button onClick={() => toggleFeatured(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.featured ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>
                                    <Star size={16} fill={item.featured ? '#f59e0b' : 'none'} />
                                  </button>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      onClick={() => setModal({ mode: 'edit', item: { ...item }, catName: `${menu.name} › ${cat.name}`, menuIdx: mIdx, catIdx: cIdx, catId: cat.id })}
                                      className="admin-btn admin-btn-ghost"
                                      style={{ padding: '6px 10px' }}
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button onClick={() => deleteItem(item)} className="admin-btn admin-btn-danger" style={{ padding: '6px 10px' }}>
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {/* Add item button row */}
                            <tr>
                              <td colSpan={7}>
                                <button
                                  onClick={() => setModal({ mode: 'add', item: null, catName: `${menu.name} › ${cat.name}`, menuIdx: mIdx, catIdx: cIdx, catId: cat.id })}
                                  className="admin-btn admin-btn-ghost"
                                  style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
                                >
                                  <Plus size={14} /> Add Item to {cat.name}
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {saving && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', zIndex: 500 }}>
          <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...
        </div>
      )}
    </div>
  );
}
