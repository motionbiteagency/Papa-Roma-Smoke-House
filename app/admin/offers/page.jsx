'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Save, Megaphone, Image } from 'lucide-react';
import AdminLoading from '@/app/components/admin/AdminLoading';
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

  if (loading) return <AdminLoading text="Loading offers..." />;

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
          {/* Card header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Pop-up Offer</h2>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Shown as a modal overlay on the homepage after a set delay.</p>
            </div>
            <button onClick={() => saveSection('popupOffer')} className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save Pop-up</>}
            </button>
          </div>

          {/* Enable toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: popup.enabled ? 'rgba(198,45,57,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${popup.enabled ? 'rgba(198,45,57,0.3)' : 'rgba(255,255,255,0.07)'}`, marginBottom: '1.5rem' }}>
            <input type="checkbox" id="popupEnabled" checked={!!popup.enabled} onChange={e => setField('popupOffer.enabled', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#c62d39' }} />
            <label htmlFor="popupEnabled" style={{ color: '#fff', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Enable Pop-up Offer</label>
            <span className={`admin-badge ${popup.enabled ? 'admin-badge-green' : 'admin-badge-gray'}`}>{popup.enabled ? 'Active' : 'Hidden'}</span>
          </div>

          {/* Two-column: form fields + live preview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem', alignItems: 'start' }}>

            {/* ── Left: form fields ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <Field label="Title" value={popup.title || ''} onChange={e => setField('popupOffer.title', e.target.value)} placeholder="e.g. 🔥 Special Weekend Deal" />
              <Field label="Subtitle" value={popup.subtitle || ''} onChange={e => setField('popupOffer.subtitle', e.target.value)} placeholder="e.g. Get 20% off this weekend only" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <Field label="Button Text" value={popup.buttonText || ''} onChange={e => setField('popupOffer.buttonText', e.target.value)} placeholder="e.g. Claim Offer" />
                <Field label="Show Delay (seconds)" type="number" value={popup.delaySeconds ?? 3} onChange={e => setField('popupOffer.delaySeconds', parseInt(e.target.value) || 0)} hint="Seconds after page load" />
              </div>
              <Field label="Button Link (URL)" value={popup.link || ''} onChange={e => setField('popupOffer.link', e.target.value)} placeholder="/menu/smoke-house" />

              {/* Image uploader + Canva guidance */}
              <div>
                <ImageUploader
                  label="Pop-up Image"
                  value={popup.image || ''}
                  onChange={(url) => setField('popupOffer.image', url)}
                  size="md"
                  aspect="4 / 3"
                />
                <div style={{ marginTop: '0.6rem', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 3px', fontWeight: 600 }}>📐 Recommended size: 800 × 600 px (4:3 ratio)</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.5 }}>
                    Design free on{' '}
                    <a href="https://www.canva.com/design/?type=TABhyuMoStw" target="_blank" rel="noopener noreferrer" style={{ color: '#c62d39', textDecoration: 'underline' }}>Canva</a>
                    {' '}→ create a custom size → set <strong style={{ color: 'rgba(255,255,255,0.5)' }}>800 × 600 px</strong> → download as PNG or JPG → upload here.
                    Leave empty for a text-only pop-up.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: live preview ── */}
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.75rem' }}>Live Preview</p>

              {/* Simulated dark overlay background */}
              <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Popup card */}
                <div style={{
                  background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)',
                  border: '1px solid rgba(212,168,83,0.3)',
                  borderRadius: '16px',
                  width: '100%',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                }}>
                  {/* Image area */}
                  {popup.image ? (
                    <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: '#000' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={popup.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '4/3', background: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1.75rem' }}>🖼️</span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>No image uploaded</span>
                    </div>
                  )}

                  {/* Text + button */}
                  <div style={{ padding: '1rem 1.25rem 1.5rem', textAlign: 'center' }}>
                    <h3 style={{ color: '#f5f0e8', fontWeight: 900, fontSize: '0.95rem', margin: '0 0 0.4rem', lineHeight: 1.3 }}>
                      {popup.title || <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>Offer title…</span>}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.73rem', margin: '0 0 1rem', lineHeight: 1.4 }}>
                      {popup.subtitle || <span style={{ color: 'rgba(255,255,255,0.2)' }}>Subtitle text…</span>}
                    </p>
                    <span style={{ display: 'inline-block', background: '#d4a853', color: '#000', fontWeight: 800, padding: '0.45rem 1.25rem', borderRadius: '100px', fontSize: '0.78rem' }}>
                      {popup.buttonText || 'Claim Offer'}
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '0.5rem', margin: '0.5rem 0 0' }}>
                Updates live as you type
              </p>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Enable toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: banner.enabled ? 'rgba(198,45,57,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${banner.enabled ? 'rgba(198,45,57,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
              <input type="checkbox" id="bannerEnabled" checked={!!banner.enabled} onChange={e => setField('imageBanner.enabled', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#c62d39' }} />
              <label htmlFor="bannerEnabled" style={{ color: '#fff', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Enable Banner Offer</label>
              <span className={`admin-badge ${banner.enabled ? 'admin-badge-green' : 'admin-badge-gray'}`}>{banner.enabled ? 'Visible' : 'Hidden'}</span>
            </div>

            {/* Image uploader + Canva guidance */}
            <div>
              <ImageUploader
                label="Banner Image"
                value={banner.imageSrc || ''}
                onChange={(url) => setField('imageBanner.imageSrc', url)}
                size="lg"
                aspect="16 / 9"
              />
              <div style={{ marginTop: '0.6rem', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 3px', fontWeight: 600 }}>📐 Recommended size: 2000 × 600 px (wide banner)</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.5 }}>
                  Design free on{' '}
                  <a href="https://www.canva.com/create/banners/" target="_blank" rel="noopener noreferrer" style={{ color: '#c62d39', textDecoration: 'underline' }}>Canva</a>
                  {' '}→ select <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Email Header</strong> or custom size <strong style={{ color: 'rgba(255,255,255,0.5)' }}>2000 × 600 px</strong> → download PNG or JPG → upload here.
                  Keep text centred so it shows on all screen sizes.
                </p>
              </div>
            </div>

            {/* Click link */}
            <Field
              label="Click Link (URL)"
              value={banner.link || ''}
              onChange={e => setField('imageBanner.link', e.target.value)}
              placeholder="/menu/smoke-house"
              hint="Where the banner links to when clicked"
            />

            {/* Live preview */}
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.75rem' }}>Live Preview</p>
              <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', padding: '1.25rem' }}>
                {banner.imageSrc ? (
                  <div style={{ width: '100%', aspectRatio: '2000/600', overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.imageSrc} alt="Banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ width: '100%', aspectRatio: '2000/600', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.75rem' }}>🖼️</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>No image uploaded yet</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '0.5rem' }}>Updates live as you upload</p>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
