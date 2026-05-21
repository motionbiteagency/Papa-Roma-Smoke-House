'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Search, X, Loader2, Check, Trash2, Pencil, ChevronDown, RefreshCw, Phone, Mail, FileText } from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────── */
const STATUS_META = {
  PENDING:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  CONFIRMED: { label: 'Confirmed', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  PREPARING: { label: 'Preparing', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  READY:     { label: 'Ready',     color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
  DELIVERED: { label: 'Delivered', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
};

const TYPE_META = {
  DINE_IN:  { label: 'Dine-in',  emoji: '🍽️' },
  TAKEAWAY: { label: 'Takeaway', emoji: '🥡' },
  DELIVERY: { label: 'Delivery', emoji: '🛵' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, color: m.color, background: m.bg, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' });
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

/* ─── Order Detail / Edit Modal ───────────────────────────────── */
function OrderModal({ order, onClose, onSave, onDelete, saving }) {
  const [form, setForm] = useState({
    status:        order.status,
    adminNote:     order.adminNote || '',
    customerName:  order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail || '',
    type:          order.type,
    tableNumber:   order.tableNumber || '',
    notes:         order.notes || '',
    discount:      order.discount ?? 0,
    items:         Array.isArray(order.items) ? order.items : [],
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.__lenis?.start();
    };
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const subtotal = form.items.reduce((s, i) => s + parseFloat(i.price || 0) * parseInt(i.quantity || 1), 0);
  const total    = Math.max(0, subtotal - parseFloat(form.discount || 0));

  const updateItem = (idx, key, val) =>
    setForm(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, [key]: val } : it) }));
  const removeItem = (idx) =>
    setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const addItem = () =>
    setForm(p => ({ ...p, items: [...p.items, { name: '', price: '', quantity: 1, menuName: '', unit: '' }] }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: 'calc(100vh - 2rem)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
              Order {order.orderNumber}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', margin: '2px 0 0' }}>
              {new Date(order.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })}
              {' · '}{timeAgo(order.createdAt)}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Status + Type row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="admin-field-group">
              <label className="admin-label">Status</label>
              <select
                className="admin-input"
                value={form.status}
                onChange={e => set('status', e.target.value)}
                style={{ color: STATUS_META[form.status]?.color }}
              >
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <option key={k} value={k} style={{ color: v.color }}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-field-group">
              <label className="admin-label">Order Type</label>
              <select className="admin-input" value={form.type} onChange={e => set('type', e.target.value)}>
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer info */}
          <div>
            <p className="admin-label" style={{ marginBottom: '0.5rem' }}>Customer</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="admin-field-group">
                <label className="admin-label">Name</label>
                <input className="admin-input" value={form.customerName} onChange={e => set('customerName', e.target.value)} />
              </div>
              <div className="admin-field-group">
                <label className="admin-label">Phone</label>
                <input className="admin-input" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} />
              </div>
              <div className="admin-field-group">
                <label className="admin-label">Email</label>
                <input className="admin-input" value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)} placeholder="—" />
              </div>
              <div className="admin-field-group">
                <label className="admin-label">Table #</label>
                <input className="admin-input" value={form.tableNumber} onChange={e => set('tableNumber', e.target.value)} placeholder="—" />
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <p className="admin-label" style={{ margin: 0 }}>Items</p>
              <button type="button" onClick={addItem} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {form.items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 60px 36px', gap: '0.5rem', alignItems: 'center' }}>
                  <input className="admin-input" placeholder="Item name" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} style={{ padding: '0.5rem 0.75rem' }} />
                  <input className="admin-input" type="number" placeholder="Price" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} style={{ padding: '0.5rem 0.75rem' }} />
                  <input className="admin-input" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} style={{ padding: '0.5rem 0.75rem' }} />
                  <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              <span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Discount (৳)</span>
              <input
                type="number" min="0" className="admin-input"
                value={form.discount}
                onChange={e => set('discount', e.target.value)}
                style={{ width: 90, padding: '0.35rem 0.6rem', textAlign: 'right' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#d4a853', fontSize: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.5rem' }}>
              <span>Total</span><span>৳{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Customer notes */}
          {form.notes && (
            <div className="admin-field-group">
              <label className="admin-label">Customer Notes</label>
              <textarea className="admin-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          )}

          {/* Admin note */}
          <div className="admin-field-group">
            <label className="admin-label">Admin Note <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(internal, not shown to customer)</span></label>
            <textarea className="admin-input" rows={2} placeholder="Internal note for staff…" value={form.adminNote} onChange={e => set('adminNote', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          {confirmDelete ? (
            <>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Delete this order?</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setConfirmDelete(false)} className="admin-btn admin-btn-ghost">Cancel</button>
                <button onClick={() => onDelete(order.id)} className="admin-btn admin-btn-danger" disabled={saving}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={14} />} Yes, Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setConfirmDelete(true)} className="admin-btn admin-btn-danger" style={{ padding: '7px 14px' }}>
                <Trash2 size={14} /> Delete
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onClose} className="admin-btn admin-btn-ghost">Cancel</button>
                <button onClick={() => onSave({ ...form, id: order.id, items: form.items, discount: parseFloat(form.discount || 0) })} className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</> : <><Check size={14} /> Save Changes</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Create Order Modal ──────────────────────────────────────── */
function CreateOrderModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    type: 'DINE_IN', tableNumber: '', notes: '', adminNote: '',
    discount: 0,
    items: [{ name: '', price: '', quantity: 1, menuName: '', unit: '' }],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.__lenis?.start();
    };
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const updateItem = (idx, key, val) =>
    setForm(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, [key]: val } : it) }));
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { name: '', price: '', quantity: 1, menuName: '', unit: '' }] }));

  const subtotal = form.items.reduce((s, i) => s + parseFloat(i.price || 0) * parseInt(i.quantity || 1), 0);
  const total    = Math.max(0, subtotal - parseFloat(form.discount || 0));

  const handleSave = () => {
    setError('');
    if (!form.customerName.trim())  { setError('Customer name is required.');  return; }
    if (!form.customerPhone.trim()) { setError('Customer phone is required.'); return; }
    const validItems = form.items.filter(i => i.name.trim() && parseFloat(i.price) > 0);
    if (validItems.length === 0) { setError('Add at least one item with a name and price.'); return; }
    onSave({ ...form, items: validItems, discount: parseFloat(form.discount || 0) });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: 'calc(100vh - 2rem)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Create New Order</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>

        <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Order type */}
          <div className="admin-field-group">
            <label className="admin-label">Order Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
              {Object.entries(TYPE_META).map(([k, v]) => (
                <button key={k} type="button" onClick={() => set('type', k)}
                  style={{ padding: '0.6rem', borderRadius: 10, border: `1px solid ${form.type === k ? 'rgba(212,168,83,0.5)' : 'rgba(255,255,255,0.08)'}`, background: form.type === k ? 'rgba(212,168,83,0.1)' : 'rgba(255,255,255,0.03)', color: form.type === k ? '#d4a853' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600 }}>
                  {v.emoji} {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="admin-field-group">
              <label className="admin-label">Name <span style={{ color: '#c62d39' }}>*</span></label>
              <input className="admin-input" placeholder="Customer name" value={form.customerName} onChange={e => set('customerName', e.target.value)} />
            </div>
            <div className="admin-field-group">
              <label className="admin-label">Phone <span style={{ color: '#c62d39' }}>*</span></label>
              <input className="admin-input" placeholder="017XXXXXXXX" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} />
            </div>
            <div className="admin-field-group">
              <label className="admin-label">Email</label>
              <input className="admin-input" placeholder="Optional" value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)} />
            </div>
            <div className="admin-field-group">
              <label className="admin-label">Table #</label>
              <input className="admin-input" placeholder="Dine-in only" value={form.tableNumber} onChange={e => set('tableNumber', e.target.value)} />
            </div>
          </div>

          {/* Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <p className="admin-label" style={{ margin: 0 }}>Items</p>
              <button type="button" onClick={addItem} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                <Plus size={12} /> Add Row
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {form.items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 60px 36px', gap: '0.5rem', alignItems: 'center' }}>
                  <input className="admin-input" placeholder="Item name" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} style={{ padding: '0.5rem 0.75rem' }} />
                  <input className="admin-input" type="number" placeholder="৳ Price" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} style={{ padding: '0.5rem 0.75rem' }} />
                  <input className="admin-input" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} style={{ padding: '0.5rem 0.75rem' }} />
                  <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              <span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Discount (৳)</span>
              <input type="number" min="0" className="admin-input" value={form.discount} onChange={e => set('discount', e.target.value)} style={{ width: 90, padding: '0.35rem 0.6rem', textAlign: 'right' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#d4a853', fontSize: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.5rem' }}>
              <span>Total</span><span>৳{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="admin-field-group">
            <label className="admin-label">Notes / Special Instructions</label>
            <textarea className="admin-input" rows={2} placeholder="Any special requests…" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          {error && <p style={{ fontSize: '0.82rem', color: '#e05060', margin: 0, background: 'rgba(224,80,96,0.08)', border: '1px solid rgba(224,80,96,0.2)', borderRadius: 8, padding: '0.6rem 0.9rem' }}>⚠ {error}</p>}
        </div>

        <div style={{ flexShrink: 0, padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} className="admin-btn admin-btn-ghost">Cancel</button>
          <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating…</> : <><Check size={14} /> Create Order</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */
const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders]           = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [activeTab, setActiveTab]     = useState('ALL');
  const [search, setSearch]           = useState('');
  const [modal, setModal]             = useState(null); // 'create' | { order }
  const [toast, setToast]             = useState(null);
  const autoRefreshRef                = useRef(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchOrders = useCallback(async (tab = activeTab, q = search) => {
    try {
      const params = new URLSearchParams();
      if (tab !== 'ALL') params.set('status', tab);
      if (q.trim())      params.set('search', q.trim());
      const res  = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      setOrders(json.orders || []);
      setStatusCounts(json.statusCounts || {});
    } catch { showToast('Failed to load orders', 'error'); }
    finally { setLoading(false); }
  }, [activeTab, search]);

  // Initial load
  useEffect(() => { fetchOrders(); }, []);

  // Auto-refresh every 30 s
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => fetchOrders(), 30_000);
    return () => clearInterval(autoRefreshRef.current);
  }, [fetchOrders]);

  // Re-fetch when tab or search changes
  useEffect(() => { setLoading(true); fetchOrders(activeTab, search); }, [activeTab, search]);

  const totalForTab = (tab) => {
    if (tab === 'ALL') return Object.values(statusCounts).reduce((s, n) => s + n, 0);
    return statusCounts[tab] || 0;
  };

  const withSaving = async (fn) => {
    setSaving(true);
    try { await fn(); }
    catch (e) { showToast(e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleCreate = async (form) => {
    await withSaving(async () => {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createOrder', data: form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setModal(null);
      showToast(`Order ${json.order.orderNumber} created!`);
      fetchOrders();
    });
  };

  const handleSave = async (form) => {
    await withSaving(async () => {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateOrder', data: form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setModal(null);
      showToast('Order updated!');
      fetchOrders();
    });
  };

  const handleDelete = async (id) => {
    await withSaving(async () => {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteOrder', data: { id } }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setModal(null);
      showToast('Order deleted');
      fetchOrders();
    });
  };

  // Quick status change from table row (dropdown)
  const quickStatus = async (order, status) => {
    await withSaving(async () => {
      await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateOrder', data: { id: order.id, status } }),
      });
      fetchOrders();
    });
  };

  const pendingCount = statusCounts['PENDING'] || 0;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {modal === 'create' && (
        <CreateOrderModal onClose={() => setModal(null)} onSave={handleCreate} saving={saving} />
      )}
      {modal?.order && (
        <OrderModal order={modal.order} onClose={() => setModal(null)} onSave={handleSave} onDelete={handleDelete} saving={saving} />
      )}

      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            Order Management
            {pendingCount > 0 && (
              <span style={{ marginLeft: 10, background: '#c62d39', color: '#fff', fontSize: '0.7rem', fontWeight: 700, borderRadius: 100, padding: '2px 9px', verticalAlign: 'middle' }}>
                {pendingCount} new
              </span>
            )}
          </h1>
          <p className="admin-page-sub">Track, manage and update all customer orders in real time.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => fetchOrders()} className="admin-btn admin-btn-ghost" title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setModal('create')} className="admin-btn admin-btn-primary">
            <Plus size={14} /> New Order
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
        <input
          className="admin-input"
          style={{ paddingLeft: 36 }}
          placeholder="Search by name, phone or order number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 2 }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.25rem', overflowX: 'auto' }}>
        {STATUS_TABS.map(tab => {
          const count = totalForTab(tab);
          const isActive = activeTab === tab;
          const meta = STATUS_META[tab];
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? (meta?.color || '#fff') : 'rgba(255,255,255,0.4)', borderBottom: isActive ? `2px solid ${meta?.color || '#fff'}` : '2px solid transparent', transition: 'all 0.15s' }}>
              {tab === 'ALL' ? 'All' : (meta?.label || tab)}
              {count > 0 && (
                <span style={{ background: isActive ? (meta?.color || '#fff') : 'rgba(255,255,255,0.1)', color: isActive ? '#000' : 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 700, borderRadius: 100, padding: '1px 6px' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>📋</p>
            <p>No orders found.</p>
          </div>
        ) : (
          <table className="admin-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Items</th>
                <th>Total</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const itemsArr = Array.isArray(order.items) ? order.items : [];
                const typeMeta = TYPE_META[order.type] || TYPE_META.DINE_IN;
                return (
                  <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => setModal({ order })}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{order.orderNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={10} /> {order.customerPhone}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                        {typeMeta.emoji} {typeMeta.label}
                        {order.tableNumber && <span style={{ color: 'rgba(255,255,255,0.35)' }}> · T{order.tableNumber}</span>}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                      {itemsArr.length} item{itemsArr.length !== 1 ? 's' : ''}
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {itemsArr.map(i => i.name).join(', ')}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#d4a853' }}>৳{order.total.toLocaleString()}</td>
                    <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                      {timeAgo(order.createdAt)}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => quickStatus(order, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{ background: STATUS_META[order.status]?.bg, color: STATUS_META[order.status]?.color, border: `1px solid ${STATUS_META[order.status]?.color}40`, borderRadius: 8, padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                      >
                        {Object.entries(STATUS_META).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button onClick={() => setModal({ order })} className="admin-btn admin-btn-ghost" style={{ padding: '6px 10px' }}>
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.75rem', textAlign: 'right' }}>
        Auto-refreshes every 30 seconds
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
