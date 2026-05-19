'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { Crown, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import styles from './login.module.css';

export default function MemberLoginPage() {
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
    const result = await signIn('member-credentials', { email: form.email, password: form.password, redirect: false });
    if (result?.error) {
      setError('Invalid email or password. Please check your credentials.');
      setLoading(false);
    } else {
      router.push('/member');
      router.refresh();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Image src="/images/beef-club-logo.png" alt="Beef Eater Club" width={200} height={60} style={{ objectFit: 'contain' }} />
        </div>
        <div className={styles.iconWrap}><Crown size={28} /></div>
        <h1 className={styles.title}>Member Login</h1>
        <p className={styles.subtitle}>Sign in to access your Beef Eater Club benefits</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.fieldWrap}>
            <Mail size={15} className={styles.fieldIcon} />
            <input type="email" placeholder="Your email address" value={form.email}
              onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(''); }}
              className={`${styles.input} ${error ? styles.inputError : ''}`} />
          </div>
          <div className={styles.fieldWrap}>
            <Lock size={15} className={styles.fieldIcon} />
            <input type={showPw ? 'text' : 'password'} placeholder="Your password" value={form.password}
              onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
              className={`${styles.input} ${error ? styles.inputError : ''}`} />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <><Loader2 size={16} className={styles.spinner} /> Signing in...</> : <><Crown size={16} /> Enter the Club</>}
          </button>
        </form>

        <div className={styles.divider}><span>Don't have membership?</span></div>
        <a href="/beef-club" className={styles.joinLink}>Join the Beef Eater Club →</a>
        <p className={styles.footer}>Papa Roma Smoke House · Members Portal</p>
      </div>
    </div>
  );
}
