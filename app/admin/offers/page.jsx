'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Save, Megaphone, Image } from 'lucide-react';
import ImageUploader from '@/app/components/admin/ImageUploader';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

function Field({ label, type = 'text', value, onChange, placeholder, rows, hint }) {
  return (
    <div className="admin-field-group">
      <label className="admin-label">{label}</label>
      {rows
        ? <textarea className="admin-input" value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ resize: 'vertical' }} />
        : <input className="admin-input" type={type} value={value} onChange={onChange} placeholder={placeholder} />
      }
      {hint && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{hint}</p>}
    </div>
  );
}

export default function AdminOffersPage() {
  const [activeTab, setActiveTab] = useState('popup');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/siteconfig');
    const json = await res.json();
    setConfig(json);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setField = (path, value) => {
    setConfig(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const saveSection = async (key) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/siteconfig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: config[key] }),
      });
      if (res.ok) showToast(key === 'popupOffer' ? 'Pop-up offer saved!' : 'Banner offer saved!');
      else showToast('Failed to save', 'error');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id: 'popup',  label: 'Pop-up Offer',  icon: <Megaphone size={14} /> },
    { id: 'banner', label: 'Banner Offer',  icon: <Image size={14} /> },
  ];

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading...</div>;

  const popup  = config?.popupOffer  || {};
  const banner = config?.imageBanner || {};

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="admin-page-header">
        <h1 className="admin-page-title">Offers</h1>
        <p className="admin-page-sub">Manage the homepage pop-up offer and the homepage banner offer.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem', paddingBottom: '1px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === t.id ? '#c62d39' : 'rgba(255,255,255,0.45)', fontWeight: activeTab === t.id ? 700 : 500, fontSize: '0.875rem', borderBottom: activeTab === t.id ? '2px solid #c62d39' : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Pop-up Offer ── */}
      {activeTab === 'popup' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Pop-up Offer</h2>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Shown as a modal overlay on the homepage after a set delay.</p>
            </div>
            <button onClick={() => saveSection('popupOffer')} className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save Pop-up</>}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: popup.enabled ? 'rgba(198,45,57,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${popup.enabled ? 'rgba(198,45,57,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
              <input type="checkbox" id="popupEnabled" checked={!!popup.enabled} onChange={e => setField('popupOffer.enabled', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#c62d39' }} />
              <label htmlFor="popupEnabled" style={{ color: '#fff', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Enable Pop-up Offer</label>
              <span className={`admin-badge ${popup.enabled ? 'admin-badge-green' : 'admin-badge-gray'}`}>{popup.enabled ? 'Active' : 'Hidden'}</span>
            </div>

            <Field label="Title" value={popup.title || ''} onChange={e => setField('popupOffer.title', e.target.value)} placeholder="e.g. 🔥 Special Weekend Deal" />
            <Field label="Subtitle" value={popup.subtitle || ''} onChange={e => setField('popupOffer.subtitle', e.target.value)} placeholder="e.g. Get 20% off this weekend only" />
            <Field label="Button Text" value={popup.buttonText || ''} onChange={e => setField('popupOffer.buttonText', e.target.value)} placeholder="e.g. Claim Offer" />
            <Field label="Button Link (URL)" value={popup.link || ''} onChange={e => setField('popupOffer.link', e.target.value)} placeholder="/menu/smoke-house" />
            <Field label="Show Delay (seconds)" type="number" value={popup.delaySeconds ?? 3} onChange={e => setField('popupOffer.delaySeconds', parseInt(e.target.value) || 0)} hint="Seconds after page load before the pop-up appears" />
            <div style={{ gridColumn: '1/-1' }}>
              <ImageUploader
                label="Pop-up Image"
                value={popup.image || ''}
                onChange={(url) => setField('popupOffer.image', url)}
                size="lg"
                aspect="4 / 3"
                hint="Optional. Leave empty for a text-only pop-up. JPG, PNG, WEBP up to 5 MB."
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Banner Offer ── */}
      {activeTab === 'banner' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Banner Offer</h2>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Full-width image banner displayed in the Offers section on the homepage.</p>
            </div>
            <button onClick={() => saveSection('imageBanner')} className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save Banner</>}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: banner.enabled ? 'rgba(198,45,57,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${banner.enabled ? 'rgba(198,45,57,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
              <input type="checkbox" id="bannerEnabled" checked={!!banner.enabled} onChange={e => setField('imageBanner.enabled', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#c62d39' }} />
              <label htmlFor="bannerEnabled" style={{ color: '#fff', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Enable Banner Offer</label>
              <span className={`admin-badge ${banner.enabled ? 'admin-badge-green' : 'admin-badge-gray'}`}>{banner.enabled ? 'Visible' : 'Hidden'}</span>
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <ImageUploader
                label="Banner Image"
                value={banner.imageSrc || ''}
                onChange={(url) => setField('imageBanner.imageSrc', url)}
                size="lg"
                aspect="16 / 9"
                hint="Wide image looks best (e.g. 1600×600). JPG, PNG, WEBP up to 5 MB."
              />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Field
                label="Click Link (URL)"
                value={banner.link || ''}
                onChange={e => setField('imageBanner.link', e.target.value)}
                placeholder="/menu/smoke-house"
                hint="Where the banner links to when clicked"
              />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
