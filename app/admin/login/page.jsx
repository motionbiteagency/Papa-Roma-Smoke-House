'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    const result = await signIn('admin-credentials', { email: form.email, password: form.password, redirect: false });
    if (result?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Image src="/images/logo.png" alt="Papa Roma" width={52} height={52} style={{ objectFit: 'contain' }} />
            <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '1.5px' }}>PAPA ROMA</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px' }}>FOOD ENGINEERING</div>
            </div>
          </div>
        </div>
        <div className={styles.iconWrap}><ShieldCheck size={32} /></div>
        <h1 className={styles.title}>Admin Portal</h1>
        <p className={styles.subtitle}>Enter your password to access the dashboard</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldWrap}>
            <Lock size={16} className={styles.fieldIcon} />
            <input type="email" value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(''); }}
              placeholder="Admin email" className={`${styles.input} ${error ? styles.inputError : ''}`} autoComplete="email" />
          </div>
          <div className={styles.fieldWrap}>
            <Lock size={16} className={styles.fieldIcon} />
            <input type={showPw ? 'text' : 'password'} value={form.password}
              onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
              placeholder="Admin password" className={`${styles.input} ${error ? styles.inputError : ''}`} autoComplete="current-password" />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <><Loader2 size={18} className={styles.spinner} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>Papa Roma Smoke House · Admin Panel</p>
      </div>
    </div>
  );
}
