'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Check, X, Eye, EyeOff, GripVertical } from 'lucide-react';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`admin-toast admin-toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

const EMPTY = { title: '', youtubeId: '', category: 'Smoke House', duration: '', views: '', featured: false };
const CATEGORIES = ['Smoke House', 'Bangla Kuthir', 'Pushkin', 'Beverages', 'Reels', 'General'];

export default function AdminVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newVideo, setNewVideo] = useState(EMPTY);
  const [adding, setAdding] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/videos');
      const data = await res.json();
      setVideos(data.videos || []);
    } catch { showToast('Failed to load videos', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const addVideo = async () => {
    if (!newVideo.title.trim() || !newVideo.youtubeId.trim()) {
      showToast('Title and YouTube ID are required', 'error');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', data: newVideo }),
      });
      if (res.ok) {
        showToast('Video added!');
        setNewVideo(EMPTY);
        setShowAdd(false);
        fetchVideos();
      } else {
        const j = await res.json();
        showToast(j.error || 'Failed to add', 'error');
      }
    } catch { showToast('Failed to add', 'error'); }
    finally { setAdding(false); }
  };

  const deleteVideo = async (id) => {
    if (!confirm('Remove this video?')) return;
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', data: { id } }),
      });
      if (res.ok) { showToast('Video removed'); fetchVideos(); }
      else {
        const j = await res.json();
        showToast(j.error || 'Failed to delete', 'error');
      }
    } catch { showToast('Failed to delete — DB may be offline', 'error'); }
  };

  const toggleActive = async (id, active) => {
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', data: { id, active: !active } }),
      });
      if (res.ok) { fetchVideos(); }
      else {
        const j = await res.json();
        showToast(j.error || 'Failed to update', 'error');
      }
    } catch { showToast('Failed to update — DB may be offline', 'error'); }
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading videos...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Videos Manager</h1>
          <p className="admin-page-sub">{videos.length} video{videos.length !== 1 ? 's' : ''} in the database.</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="admin-btn admin-btn-primary">
          <Plus size={14} /> Add Video
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="admin-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(198,45,57,0.3)' }}>
          <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Add New Video</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="admin-field-group" style={{ gridColumn: '1/-1' }}>
              <label className="admin-label">Title *</label>
              <input className="admin-input" placeholder="e.g. Mastering the Texas Brisket" value={newVideo.title} onChange={e => setNewVideo(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="admin-field-group">
              <label className="admin-label">YouTube ID *</label>
              <input className="admin-input" placeholder="e.g. liExnlWDR30" value={newVideo.youtubeId} onChange={e => setNewVideo(p => ({ ...p, youtubeId: e.target.value }))} />
              {newVideo.youtubeId && (
                <a href={`https://youtube.com/watch?v=${newVideo.youtubeId}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#c62d39', marginTop: '4px', display: 'inline-block' }}>
                  Preview ↗
                </a>
              )}
            </div>
            <div className="admin-field-group">
              <label className="admin-label">Category</label>
              <select className="admin-input" value={newVideo.category} onChange={e => setNewVideo(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field-group">
              <label className="admin-label">Duration</label>
              <input className="admin-input" placeholder="e.g. 8:42" value={newVideo.duration} onChange={e => setNewVideo(p => ({ ...p, duration: e.target.value }))} />
            </div>
            <div className="admin-field-group">
              <label className="admin-label">Views</label>
              <input className="admin-input" placeholder="e.g. 2.1M" value={newVideo.views} onChange={e => setNewVideo(p => ({ ...p, views: e.target.value }))} />
            </div>
            <div className="admin-field-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '1.5rem' }}>
              <input type="checkbox" id="featured" checked={newVideo.featured} onChange={e => setNewVideo(p => ({ ...p, featured: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#c62d39' }} />
              <label htmlFor="featured" className="admin-label" style={{ margin: 0, cursor: 'pointer' }}>Featured video</label>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '8px' }}>
              <button onClick={addVideo} disabled={adding} className="admin-btn admin-btn-primary">
                {adding ? 'Adding...' : <><Check size={14} /> Add Video</>}
              </button>
              <button onClick={() => { setShowAdd(false); setNewVideo(EMPTY); }} className="admin-btn admin-btn-ghost">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Videos Table */}
      <div className="admin-card">
        {videos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
            <p>No videos yet. Click <strong style={{ color: '#fff' }}>Add Video</strong> to get started.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Preview</th>
                <th>Title</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Views</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v, idx) => (
                <tr key={v.id} style={{ opacity: v.active ? 1 : 0.45 }}>
                  <td style={{ color: 'rgba(255,255,255,0.3)' }}>{idx + 1}</td>
                  <td>
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                      alt={v.title}
                      style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 6 }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{v.title}</div>
                    <a
                      href={`https://youtube.com/watch?v=${v.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.72rem', color: '#c62d39', fontFamily: 'monospace' }}
                    >
                      {v.youtubeId} ↗
                    </a>
                    {v.featured && <span className="admin-badge admin-badge-gold" style={{ marginLeft: 6, fontSize: '0.65rem' }}>Featured</span>}
                  </td>
                  <td><span className="admin-badge admin-badge-gold">{v.category}</span></td>
                  <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{v.duration || '—'}</td>
                  <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{v.views || '—'}</td>
                  <td>
                    <span className={`admin-badge ${v.active ? 'admin-badge-green' : 'admin-badge-red'}`}>
                      {v.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => toggleActive(v.id, v.active)}
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '6px 10px' }}
                        title={v.active ? 'Hide' : 'Show'}
                      >
                        {v.active ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        onClick={() => deleteVideo(v.id)}
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '6px 10px' }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
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
