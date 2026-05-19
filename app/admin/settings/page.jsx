'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('restaurant');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/siteconfig');
    setConfig(await res.json());
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

  const TABS = [
    { id: 'restaurant', label: 'Restaurant Info' },
    { id: 'hero', label: 'Hero Slides' },
    { id: 'popup', label: 'Pop-up Offer' },
    { id: 'banner', label: 'Image Banner' },
    { id: 'payment', label: 'Payment Methods' },
  ];

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading settings...</div>;

  const r = config.restaurant;
  const popup = config.popupOffer;
  const banner = config.imageBanner;
  const bkash = config.paymentMethods?.bkash;
  const nagad = config.paymentMethods?.nagad;
  const bank = config.paymentMethods?.bank;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Site Settings</h1>
          <p className="admin-page-sub">Update restaurant info, hero slides, payment numbers, and more.</p>
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
        {activeTab === 'restaurant' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1/-1' }}><Field label="Restaurant Name" value={r.name} onChange={e => set('restaurant.name', e.target.value)} /></div>
            <Field label="Tagline" value={r.tagline} onChange={e => set('restaurant.tagline', e.target.value)} />
            <Field label="Phone" value={r.phone} onChange={e => set('restaurant.phone', e.target.value)} />
            <Field label="WhatsApp Number (digits only)" value={r.whatsapp} onChange={e => set('restaurant.whatsapp', e.target.value)} />
            <Field label="Email" type="email" value={r.email} onChange={e => set('restaurant.email', e.target.value)} />
            <div style={{ gridColumn: '1/-1' }}><Field label="Address" value={r.address} onChange={e => set('restaurant.address', e.target.value)} /></div>
            <Field label="Opening Hours" value={r.hours} onChange={e => set('restaurant.hours', e.target.value)} />
            <Field label="Facebook URL" value={r.facebook} onChange={e => set('restaurant.facebook', e.target.value)} />
            <Field label="Instagram URL" value={r.instagram || ''} onChange={e => set('restaurant.instagram', e.target.value)} />
            <div style={{ gridColumn: '1/-1' }}><Field label="Description" value={r.description} onChange={e => set('restaurant.description', e.target.value)} rows={3} /></div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div>
            {config.heroSlides.map((slide, i) => (
              <div key={i} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Slide {i + 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Image Path" value={slide.image} onChange={e => set(`heroSlides.${i}.image`, e.target.value)} placeholder="/images/hero-xxx.png" />
                  <Field label="Subtitle" value={slide.subtitle} onChange={e => set(`heroSlides.${i}.subtitle`, e.target.value)} />
                  <div style={{ gridColumn: '1/-1' }}>
                    <label className="admin-label">Title Words (comma-separated)</label>
                    <input className="admin-input" value={slide.title.join(', ')} onChange={e => set(`heroSlides.${i}.title`, e.target.value.split(',').map(s => s.trim()))} placeholder="Where, Smoke, Meets, Flavor" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'popup' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <input type="checkbox" id="popupEnabled" checked={popup.enabled} onChange={e => set('popupOffer.enabled', e.target.checked)} style={{ width: 18, height: 18 }} />
              <label htmlFor="popupEnabled" style={{ color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Pop-up Offer Enabled</label>
            </div>
            <Field label="Title" value={popup.title} onChange={e => set('popupOffer.title', e.target.value)} />
            <Field label="Subtitle" value={popup.subtitle} onChange={e => set('popupOffer.subtitle', e.target.value)} />
            <Field label="Button Text" value={popup.buttonText} onChange={e => set('popupOffer.buttonText', e.target.value)} />
            <Field label="Link (URL)" value={popup.link} onChange={e => set('popupOffer.link', e.target.value)} />
            <Field label="Image Path" value={popup.image} onChange={e => set('popupOffer.image', e.target.value)} />
            <Field label="Delay (seconds)" type="number" value={popup.delaySeconds} onChange={e => set('popupOffer.delaySeconds', parseInt(e.target.value))} />
          </div>
        )}

        {activeTab === 'banner' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <input type="checkbox" id="bannerEnabled" checked={banner.enabled} onChange={e => set('imageBanner.enabled', e.target.checked)} style={{ width: 18, height: 18 }} />
              <label htmlFor="bannerEnabled" style={{ color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Image Banner Enabled</label>
            </div>
            <Field label="Banner Image Path" value={banner.imageSrc} onChange={e => set('imageBanner.imageSrc', e.target.value)} placeholder="/images/banar/xxx.png" />
            <Field label="Link (URL)" value={banner.link} onChange={e => set('imageBanner.link', e.target.value)} placeholder="/menu/smoke-house" />
          </div>
        )}

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
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
