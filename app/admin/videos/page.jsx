'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

export default function AdminVideosPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', youtubeId: '', category: 'Smoke House', duration: '', views: '', featured: false });

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/siteconfig');
    setConfig(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async (updated) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/siteconfig', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
      if (res.ok) { setConfig(updated); showToast('Saved!'); }
      else showToast('Failed', 'error');
    } catch { showToast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteVideo = (idx) => {
    if (!confirm('Remove this video?')) return;
    const updated = JSON.parse(JSON.stringify(config));
    updated.cookingVideos.videos.splice(idx, 1);
    save(updated);
  };

  const addVideo = () => {
    if (!newVideo.title || !newVideo.youtubeId) { showToast('Title and YouTube ID required', 'error'); return; }
    const updated = JSON.parse(JSON.stringify(config));
    updated.cookingVideos.videos.push({ id: `cv_${Date.now()}`, ...newVideo });
    save(updated);
    setShowAdd(false);
    setNewVideo({ title: '', youtubeId: '', category: 'Smoke House', duration: '', views: '', featured: false });
  };

  const toggleEnabled = () => {
    const updated = JSON.parse(JSON.stringify(config));
    updated.cookingVideos.enabled = !updated.cookingVideos.enabled;
    save(updated);
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading...</div>;

  const videos = config.cookingVideos?.videos || [];

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Videos Manager</h1>
          <p className="admin-page-sub">{videos.length} videos configured.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={config.cookingVideos?.enabled ?? false} onChange={toggleEnabled} style={{ width: 16, height: 16 }} />
            Section Enabled
          </label>
          <button onClick={() => setShowAdd(v => !v)} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Video</button>
        </div>
      </div>

      {showAdd && (
        <div className="admin-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(198,45,57,0.3)' }}>
          <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Add New Video</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'YouTube ID *', key: 'youtubeId', placeholder: 'e.g. liExnlWDR30' },
              { label: 'Category', key: 'category', placeholder: 'e.g. Smoke House, Reels' },
              { label: 'Duration', key: 'duration', placeholder: 'e.g. 8:42' },
              { label: 'Views', key: 'views', placeholder: 'e.g. 2.1M' },
            ].map(f => (
              <div key={f.key} className="admin-field-group">
                <label className="admin-label">{f.label}</label>
                <input className="admin-input" placeholder={f.placeholder} value={newVideo[f.key]} onChange={e => setNewVideo(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="admin-field-group" style={{ gridColumn: '1/-1' }}>
              <label className="admin-label">Title *</label>
              <input className="admin-input" placeholder="Video title" value={newVideo.title} onChange={e => setNewVideo(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '8px' }}>
              <button onClick={addVideo} className="admin-btn admin-btn-primary"><Check size={14} /> Add</button>
              <button onClick={() => setShowAdd(false)} className="admin-btn admin-btn-ghost"><X size={14} /> Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>#</th><th>Preview</th><th>Title</th><th>Category</th><th>Duration</th><th>Remove</th></tr></thead>
          <tbody>
            {videos.map((v, idx) => (
              <tr key={idx}>
                <td style={{ color: 'rgba(255,255,255,0.3)' }}>{idx + 1}</td>
                <td>
                  <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 6 }} />
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{v.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{v.youtubeId}</div>
                </td>
                <td><span className="admin-badge admin-badge-gold">{v.category}</span></td>
                <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{v.duration}</td>
                <td>
                  <button onClick={() => deleteVideo(idx)} className="admin-btn admin-btn-danger" style={{ padding: '6px 10px' }}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
