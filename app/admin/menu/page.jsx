'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Pencil, X, ChevronDown, ChevronRight, Star, Loader2, Check } from 'lucide-react';

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

const EMPTY_ITEM = { name: '', nameBn: '', description: '', price: '', unit: '', featured: false };

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

export default function AdminMenuPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);
  const [editItem, setEditItem] = useState(null);       // { item } — full Prisma item copy
  const [addTarget, setAddTarget] = useState(null);     // { menuIdx, catIdx, catId }
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [confirm, setConfirm] = useState(null);         // { message, onConfirm }

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
    // Optimistic update
    setData(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      for (const mt of clone.menuTypes)
        for (const cat of mt.categories)
          for (const it of cat.items)
            if (it.id === item.id) it.featured = !it.featured;
      return clone;
    });
    withSaving(async () => {
      await apiCall('toggleFeatured', { id: item.id, featured: !item.featured });
    });
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

  const saveEditItem = async () => {
    if (!editItem) return;
    await withSaving(async () => {
      const { id, name, nameBn, description, price, unit, featured } = editItem;
      await apiCall('updateItem', { id, name, nameBn, description, price: parseFloat(price) || 0, unit, featured });
      setData(prev => {
        const clone = JSON.parse(JSON.stringify(prev));
        for (const mt of clone.menuTypes)
          for (const cat of mt.categories)
            for (let i = 0; i < cat.items.length; i++)
              if (cat.items[i].id === id)
                cat.items[i] = { ...cat.items[i], name, nameBn, description, price: parseFloat(price) || 0, unit, featured };
        return clone;
      });
      showToast('Item updated!');
      setEditItem(null);
    });
  };

  const saveNewItem = async () => {
    if (!newItem.name.trim() || !newItem.price) { showToast('Name and price are required', 'error'); return; }
    const { catId, menuIdx, catIdx } = addTarget;
    const order = data.menuTypes[menuIdx].categories[catIdx].items.length;
    await withSaving(async () => {
      const result = await apiCall('addItem', {
        categoryId: catId,
        name: newItem.name.trim(),
        nameBn: newItem.nameBn || null,
        description: newItem.description || null,
        price: parseFloat(newItem.price) || 0,
        unit: newItem.unit || null,
        featured: newItem.featured,
        active: true,
        order,
      });
      setData(prev => {
        const clone = JSON.parse(JSON.stringify(prev));
        clone.menuTypes[menuIdx].categories[catIdx].items.push(result.item);
        return clone;
      });
      showToast('Item added!');
      setAddTarget(null);
      setNewItem(EMPTY_ITEM);
    });
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading menu data...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

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
                                {editItem?.id === item.id ? (
                                  <>
                                    <td>
                                      <input className="admin-input" value={editItem.name} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} style={{ marginBottom: 4 }} placeholder="Name *" />
                                      <input className="admin-input" value={editItem.nameBn || ''} onChange={e => setEditItem(p => ({ ...p, nameBn: e.target.value }))} placeholder="Bangla name" />
                                    </td>
                                    <td>
                                      <textarea className="admin-input" value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} style={{ resize: 'vertical' }} />
                                    </td>
                                    <td><input className="admin-input" type="number" value={editItem.price} onChange={e => setEditItem(p => ({ ...p, price: e.target.value }))} /></td>
                                    <td><input className="admin-input" value={editItem.unit || ''} onChange={e => setEditItem(p => ({ ...p, unit: e.target.value }))} placeholder="e.g. per 100gm" /></td>
                                    <td><input type="checkbox" checked={!!editItem.featured} onChange={e => setEditItem(p => ({ ...p, featured: e.target.checked }))} /></td>
                                    <td>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={saveEditItem} className="admin-btn admin-btn-primary" style={{ padding: '6px 10px' }} disabled={saving}><Check size={14} /></button>
                                        <button onClick={() => setEditItem(null)} className="admin-btn admin-btn-ghost" style={{ padding: '6px 10px' }}><X size={14} /></button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td>
                                      <div style={{ fontWeight: 600, color: '#fff' }}>{item.name}</div>
                                      {item.nameBn && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{item.nameBn}</div>}
                                    </td>
                                    <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', maxWidth: 180 }}>
                                      {item.description ? <span title={item.description}>{item.description.length > 60 ? item.description.slice(0, 60) + '…' : item.description}</span> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
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
                                        <button onClick={() => { setEditItem({ ...item }); setAddTarget(null); }} className="admin-btn admin-btn-ghost" style={{ padding: '6px 10px' }}><Pencil size={13} /></button>
                                        <button onClick={() => deleteItem(item)} className="admin-btn admin-btn-danger" style={{ padding: '6px 10px' }}><Trash2 size={13} /></button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}

                            {/* Add new item row */}
                            {addTarget?.catId === cat.id ? (
                              <tr style={{ background: 'rgba(198,45,57,0.05)' }}>
                                <td>
                                  <input className="admin-input" placeholder="Name *" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} style={{ marginBottom: 4 }} />
                                  <input className="admin-input" placeholder="Bangla name" value={newItem.nameBn} onChange={e => setNewItem(p => ({ ...p, nameBn: e.target.value }))} />
                                </td>
                                <td>
                                  <textarea className="admin-input" placeholder="Description" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
                                </td>
                                <td><input className="admin-input" type="number" placeholder="Price *" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} /></td>
                                <td><input className="admin-input" placeholder="per 100gm…" value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))} /></td>
                                <td><input type="checkbox" checked={newItem.featured} onChange={e => setNewItem(p => ({ ...p, featured: e.target.checked }))} /></td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={saveNewItem} className="admin-btn admin-btn-primary" style={{ padding: '6px 10px' }} disabled={saving}><Check size={14} /></button>
                                    <button onClick={() => { setAddTarget(null); setNewItem(EMPTY_ITEM); }} className="admin-btn admin-btn-ghost" style={{ padding: '6px 10px' }}><X size={14} /></button>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              <tr>
                                <td colSpan={6}>
                                  <button
                                    onClick={() => { setAddTarget({ menuIdx: mIdx, catIdx: cIdx, catId: cat.id }); setEditItem(null); setNewItem(EMPTY_ITEM); }}
                                    className="admin-btn admin-btn-ghost"
                                    style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
                                  >
                                    <Plus size={14} /> Add Item to {cat.name}
                                  </button>
                                </td>
                              </tr>
                            )}
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
