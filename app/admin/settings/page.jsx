'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import ImageUploader from '@/app/components/admin/ImageUploader';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

function Field({ label, type = 'text', value, onChange, placeholder, rows }) {
  return (
    <div className="admin-field-group">
      <label className="admin-label">{label}</label>
      {rows
        ? <textarea className="admin-input" value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ resize: 'vertical' }} />
        : <input className="admin-input" type={type} value={value} onChange={onChange} placeholder={placeholder} />
      }
    </div>
  );
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('payment');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const [cfgRes, menuRes] = await Promise.all([
      fetch('/api/admin/siteconfig'),
      fetch('/api/admin/menus'),
    ]);
    const cfg = await cfgRes.json();
    const menu = await menuRes.json();
    setConfig(cfg);
    const flat = (menu.menuTypes || []).flatMap(mt =>
      mt.categories.flatMap(cat =>
        cat.items.map(item => ({
          id: item.itemId || item.id,
          label: `${item.name} — ${mt.name} / ${cat.name}`,
        }))
      )
    );
    setMenuItems(flat);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (path, value) => {
    setConfig(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/siteconfig', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
      if (res.ok) showToast('Settings saved!');
      else showToast('Failed to save', 'error');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pw.current || !pw.next || !pw.confirm) { showToast('All password fields are required', 'error'); return; }
    if (pw.next !== pw.confirm) { showToast('New passwords do not match', 'error'); return; }
    if (pw.next.length < 8) { showToast('New password must be at least 8 characters', 'error'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const json = await res.json();
      if (res.ok) { showToast('Password changed successfully!'); setPw({ current: '', next: '', confirm: '' }); }
      else showToast(json.error || 'Failed to change password', 'error');
    } catch { showToast('Failed to change password', 'error'); }
    finally { setPwSaving(false); }
  };

  const toggleHotPick = (itemId) => {
    const current = config.hotPicksItemIds || [];
    const updated = current.includes(itemId)
      ? current.filter(id => id !== itemId)
      : [...current, itemId];
    set('hotPicksItemIds', updated);
  };

  const TABS = [
    { id: 'payment',    label: 'Payment Methods' },
    { id: 'hotpicks',   label: 'Hot Picks' },
    { id: 'password',   label: 'Change Password' },
  ];

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading settings...</div>;

  const bkash = config.paymentMethods?.bkash;
  const nagad  = config.paymentMethods?.nagad;
  const bank   = config.paymentMethods?.bank;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Site Settings</h1>
          <p className="admin-page-sub">Update restaurant info, social links, payment numbers, and more.</p>
        </div>
        <button onClick={save} className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '1px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === t.id ? '#c62d39' : 'rgba(255,255,255,0.45)', fontWeight: activeTab === t.id ? 700 : 500, fontSize: '0.875rem', borderBottom: activeTab === t.id ? '2px solid #c62d39' : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {/* ── Payment Methods ── */}
        {activeTab === 'payment' && (
          <div>
            <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#E2136E', marginBottom: '0.75rem' }}>bKash</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Account Type" value={bkash?.type || ''} onChange={e => set('paymentMethods.bkash.type', e.target.value)} />
                <Field label="bKash Number" value={bkash?.number || ''} onChange={e => set('paymentMethods.bkash.number', e.target.value)} />
              </div>
            </div>
            <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#ED1C24', marginBottom: '0.75rem' }}>Nagad</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Account Type" value={nagad?.type || ''} onChange={e => set('paymentMethods.nagad.type', e.target.value)} />
                <Field label="Nagad Number" value={nagad?.number || ''} onChange={e => set('paymentMethods.nagad.number', e.target.value)} />
              </div>
            </div>
            <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
              <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.75rem' }}>Bank Transfer</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Bank Name" value={bank?.bankName || ''} onChange={e => set('paymentMethods.bank.bankName', e.target.value)} />
                <Field label="Account Name" value={bank?.accountName || ''} onChange={e => set('paymentMethods.bank.accountName', e.target.value)} />
                <Field label="Account Number" value={bank?.accountNumber || ''} onChange={e => set('paymentMethods.bank.accountNumber', e.target.value)} />
                <Field label="Branch Name" value={bank?.branchName || ''} onChange={e => set('paymentMethods.bank.branchName', e.target.value)} />
                <Field label="Routing Number" value={bank?.routingNumber || ''} onChange={e => set('paymentMethods.bank.routingNumber', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── Hot Picks ── */}
        {activeTab === 'hotpicks' && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Select items to feature in the <strong style={{ color: '#fff' }}>Hot Picks</strong> section on the homepage. Currently <strong style={{ color: '#c62d39' }}>{(config.hotPicksItemIds || []).length}</strong> selected.
            </p>
            {menuItems.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)' }}>No menu items found.</p>}
            <div data-lenis-prevent="true" style={{ height: '420px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px' }}>
                {menuItems.map(item => {
                  const selected = (config.hotPicksItemIds || []).includes(item.id);
                  return (
                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', background: selected ? 'rgba(198,45,57,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected ? 'rgba(198,45,57,0.3)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="checkbox" checked={selected} onChange={() => toggleHotPick(item.id)} style={{ width: 16, height: 16, accentColor: '#c62d39', flexShrink: 0 }} />
                      <span style={{ color: selected ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: '0.875rem', flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{item.id}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '1rem' }}>
              Click <strong style={{ color: '#fff' }}>Save Changes</strong> above to apply.
            </p>
          </div>
        )}

        {/* ── Change Password ── */}
        {activeTab === 'password' && (
          <div style={{ maxWidth: 420 }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Change the admin account password. You will stay logged in after saving.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Current Password', key: 'current' },
                { label: 'New Password (min. 8 chars)', key: 'next' },
                { label: 'Confirm New Password', key: 'confirm' },
              ].map(f => (
                <div key={f.key} className="admin-field-group">
                  <label className="admin-label">{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="admin-input"
                      type={showPw ? 'text' : 'password'}
                      style={{ paddingRight: 42 }}
                      value={pw[f.key]}
                      onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={changePassword} className="admin-btn admin-btn-primary" disabled={pwSaving} style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
                {pwSaving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={14} /> Change Password</>}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
