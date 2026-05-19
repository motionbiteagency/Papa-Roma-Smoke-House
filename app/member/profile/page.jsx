'use client';

import { useEffect, useState } from 'react';
import { Save, Lock, Loader2, CheckCircle } from 'lucide-react';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#222', border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(198,45,57,0.3)'}`, color: type === 'success' ? '#22c55e' : '#e05060', borderRadius: 10, padding: '12px 18px', fontSize: '0.875rem', zIndex: 999, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      {type === 'success' ? '✓ ' : '✕ '}{msg}
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, readOnly }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        style={{ background: readOnly ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '10px 13px', color: readOnly ? 'rgba(255,255,255,0.35)' : '#fff', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', cursor: readOnly ? 'not-allowed' : 'text' }} />
    </div>
  );
}

const BEEF_PREFERENCES = ['Brisket', 'Ribeye', 'Tenderloin', 'Short Ribs', 'T-Bone', 'Smoked Beef', 'All Cuts'];

export default function MemberProfilePage() {
  const [member, setMember] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', preference: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/member/profile').then(r => r.json()).then(d => {
      setMember(d.member);
      setForm({ name: d.member?.name || '', phone: d.member?.phone || '', preference: d.member?.preference || '' });
      setLoading(false);
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    const res = await fetch('/api/member/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (data.success) setToast({ msg: 'Profile updated!', type: 'success' });
    else setToast({ msg: data.error || 'Failed', type: 'error' });
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { setToast({ msg: 'New passwords do not match', type: 'error' }); return; }
    setPwSaving(true);
    const res = await fetch('/api/member/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }) });
    const data = await res.json();
    setPwSaving(false);
    if (data.success) { setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); setToast({ msg: 'Password changed!', type: 'success' }); }
    else setToast({ msg: data.error || 'Failed', type: 'error' });
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '3rem', textAlign: 'center' }}>Loading...</div>;

  const card = (title, children) => (
    <div style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
      <h2 style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{title}</h2>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 680 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>My Profile</h1>

      {card('Personal Information',
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Field label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            <Field label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+880 1XXXXXXXXX" />
          </div>
          <Field label="Email" value={member?.email || ''} readOnly />
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>Favorite Beef Cut</label>
            <select value={form.preference} onChange={e => setForm(p => ({ ...p, preference: e.target.value }))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '10px 13px', color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit' }}>
              {BEEF_PREFERENCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={saveProfile} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: 'linear-gradient(135deg, #b8913a, #8b6a20)', color: '#fff', border: 'none', borderRadius: 9, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
            {saving ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      )}

      {card('Change Password',
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { label: 'Current Password', key: 'currentPassword' },
            { label: 'New Password', key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirm' },
          ].map(f => (
            <Field key={f.key} label={f.label} type="password" value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
          ))}
          <button onClick={changePassword} disabled={pwSaving}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: 'rgba(198,45,57,0.1)', color: '#e05060', border: '1px solid rgba(198,45,57,0.2)', borderRadius: 9, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
            {pwSaving ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Updating...</> : <><Lock size={15} /> Change Password</>}
          </button>
        </div>
      )}

      {card('Membership Info',
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Membership ID', value: `BEC-${member?.membershipId?.slice(-8).toUpperCase()}` },
            { label: 'Status', value: member?.status },
            { label: 'Member Since', value: member?.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—' },
            { label: 'Loyalty Points', value: member?.points ?? 0 },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '10px 14px' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontWeight: 700, color: '#fff' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
