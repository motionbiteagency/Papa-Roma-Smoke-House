'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2, X, ImageIcon, AlertCircle } from 'lucide-react';

/**
 * Reusable secure image uploader for admin panel.
 * Uploads through /api/admin/upload (server-side ImgBB proxy).
 *
 * Props:
 *   value       — current image URL string (or empty)
 *   onChange(url)— called with the new URL after a successful upload (or '' on clear)
 *   label       — optional field label shown above
 *   hint        — small helper text below
 *   size        — 'sm' | 'md' | 'lg' (controls preview size; default 'md')
 *   aspect      — CSS aspect-ratio for preview, e.g. '1 / 1' or '16 / 9' (default '1 / 1')
 */
export default function ImageUploader({
  value = '',
  onChange,
  label,
  hint,
  size = 'md',
  aspect = '1 / 1',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const dims = { sm: 80, md: 130, lg: 180 }[size] || 130;

  const handleFiles = async (files) => {
    setError('');
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Upload failed.');
        return;
      }
      onChange?.(json.url);
    } catch (e) {
      setError('Upload failed. Check your connection.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="admin-field-group">
      {label && <label className="admin-label">{label}</label>}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Preview / drop zone */}
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            width: dims,
            minWidth: dims,
            aspectRatio: aspect,
            borderRadius: '10px',
            border: `2px dashed ${dragOver ? '#c62d39' : value ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)'}`,
            background: value ? '#0a0a0a' : (dragOver ? 'rgba(198,45,57,0.08)' : 'rgba(255,255,255,0.02)'),
            cursor: uploading ? 'wait' : 'pointer',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {!uploading && (
                <button
                  type="button"
                  onClick={handleClear}
                  title="Remove image"
                  style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '100px', width: 24, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', cursor: 'pointer', padding: 0,
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '8px' }}>
              <ImageIcon size={22} />
              <span style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>Click or drop image</span>
            </div>
          )}

          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexDirection: 'column', gap: '4px',
            }}>
              <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '0.7rem' }}>Uploading…</span>
            </div>
          )}
        </div>

        {/* Right side controls / info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              {uploading ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Upload size={13} />}
              {value ? 'Replace' : 'Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                disabled={uploading}
                className="admin-btn admin-btn-danger"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <X size={13} /> Remove
              </button>
            )}
          </div>

          {value && (
            <div
              title={value}
              style={{
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {value}
            </div>
          )}

          {hint && !error && (
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.4 }}>{hint}</p>
          )}

          {error && (
            <p style={{ fontSize: '0.72rem', color: '#e05060', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
