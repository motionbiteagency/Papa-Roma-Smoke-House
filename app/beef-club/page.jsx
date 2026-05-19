'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Crown, Percent, Gift, Star, Truck, UtensilsCrossed, 
  Flame, CheckCircle, ArrowLeft, Loader2, Users, Award, Beef
} from 'lucide-react';
import styles from './beef-club.module.css';

const BENEFITS = [
  { icon: <Percent size={22} />, title: '10% Off Every Order', desc: 'Enjoy an exclusive 10% discount on every single order you place — forever.' },
  { icon: <Star size={22} />, title: 'Special Member Offers', desc: 'Access to deals and promotions never available to the general public.' },
  { icon: <Flame size={22} />, title: 'Exclusive Beef Parties', desc: 'Cook beef yourself alongside our Master Chef in private, hands-on culinary sessions.' },
  { icon: <Truck size={22} />, title: 'Premium Beef Home Delivery', desc: 'Receive premium, hand-selected beef cuts delivered to your doorstep periodically.' },
  { icon: <UtensilsCrossed size={22} />, title: 'Early Menu Access', desc: 'Be the first to taste and order from brand-new menu items before public launch.' },
  { icon: <Gift size={22} />, title: 'Special Gifts on Milestones', desc: 'Get exclusive gifts when you hit spending milestones — our way of saying thank you.' },
  { icon: <Crown size={22} />, title: 'Beef Tasting Events', desc: 'VIP invitations to exclusive beef tasting sessions hosted by our culinary team.' },
];

const BEEF_PREFERENCES = [
  'Brisket', 'Ribeye', 'Tenderloin', 'Short Ribs', 'T-Bone', 'Smoked Beef', 'All Cuts'
];

export default function BeefClubPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', preference: '', reason: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!form.phone.trim()) e.phone = 'Please enter your phone number.';
    if (!form.email.trim()) e.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.preference) e.preference = 'Please select your beef preference.';
    if (!form.password) e.password = 'Please create a password.';
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 4000);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.successOverlay}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}><CheckCircle size={64} /></div>
          <div className={styles.successBadge}>Welcome to the Club!</div>
          <h1 className={styles.successTitle}>You're Now a Beef Eater! 🥩</h1>
          <p className={styles.successMsg}>
            Welcome, <strong>{form.name}</strong>! Your membership application to the <strong>Beef Eater Club</strong> has been received. Our team will activate your membership and contact you at <strong>{form.phone}</strong> within 24 hours.
          </p>
          <p className={styles.successSub}>Get ready for an exclusive world of beef, privileges & unforgettable experiences.</p>
          <p className={styles.successRedirect}>Redirecting you to Home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <Image src="/images/beef-club-bg.png" alt="Beef Eater Club" fill className={styles.heroBg} priority />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Link href="/" className={styles.backLink}><ArrowLeft size={16} /> Back to Home</Link>
          <div className={styles.clubLogoWrapper}>
            <Image src="/images/beef-club-logo.png" alt="Beef Eater Club Logo" width={260} height={80} style={{ objectFit: 'contain' }} />
          </div>
          <div className={styles.heroBadge}><Crown size={16} /><span>Exclusive Membership</span></div>
          <h1 className={styles.heroTitle}>
            The <span className={styles.red}>Beef Eater</span><br />Club
          </h1>
          <p className={styles.heroSubtitle}>
            Dhaka's most exclusive beef-lover community. Join a tribe of passionate carnivores who get more from every bite.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><strong>250+</strong><span>Members</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>7</strong><span>Benefits</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>Free</strong><span>to Join</span></div>
          </div>
          <a href="#join" className={styles.heroCtaBtn}>
            <Crown size={18} /> Join the Club Now
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className={styles.benefitsSection}>
        <div className="container">
          <div className="section-header">
            <span className="section-label"><Award size={14} /> Member Perks</span>
            <h2 className="section-title">Why Join the <span className={styles.redText}>Beef Eater Club</span>?</h2>
            <p className="section-subtitle">As a member, you don't just eat beef — you live it. Here's what awaits you.</p>
          </div>
          <div className={styles.benefitsGrid}>
            {BENEFITS.map((b, i) => (
              <div key={i} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>{b.icon}</div>
                <div className={styles.benefitNumber}>0{i + 1}</div>
                <h3 className={styles.benefitTitle}>{b.title}</h3>
                <p className={styles.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className={styles.formSection} id="join">
        <div className={styles.formBg} />
        <div className="container">
          <div className={styles.formWrapper}>
            <div className={styles.formLeft}>
              <div className={styles.formLeftInner}>
                <div className={styles.formLeftBadge}><Crown size={14} /> Free Membership</div>
                <h2 className={styles.formLeftTitle}>Join the<br /><span className={styles.red}>Beef Eater</span><br />Club Today</h2>
                <p className={styles.formLeftDesc}>Fill in the form and our team will activate your membership within 24 hours. No fees. No commitments. Just beef.</p>
                <ul className={styles.formLeftPerks}>
                  {BENEFITS.slice(0, 4).map((b, i) => (
                    <li key={i}><CheckCircle size={16} /> {b.title}</li>
                  ))}
                  <li><CheckCircle size={16} /> And much more...</li>
                </ul>
              </div>
            </div>

            <div className={styles.formRight}>
              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <h3 className={styles.formTitle}>Membership Application</h3>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Full Name <span className={styles.req}>*</span></label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Your full name" className={`${styles.input} ${errors.name ? styles.fieldError : ''}`} />
                  {errors.name && <p className={styles.errMsg}>{errors.name}</p>}
                </div>

                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Phone <span className={styles.req}>*</span></label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+880 1XXXXXXXXX" className={`${styles.input} ${errors.phone ? styles.fieldError : ''}`} />
                    {errors.phone && <p className={styles.errMsg}>{errors.phone}</p>}
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email <span className={styles.req}>*</span></label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="you@example.com" className={`${styles.input} ${errors.email ? styles.fieldError : ''}`} />
                    {errors.email && <p className={styles.errMsg}>{errors.email}</p>}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Favorite Beef Cut <span className={styles.req}>*</span></label>
                  <div className={styles.selectWrapper}>
                    <select name="preference" value={form.preference} onChange={handleChange}
                      className={`${styles.select} ${errors.preference ? styles.fieldError : ''}`}>
                      <option value="">Select your preference</option>
                      {BEEF_PREFERENCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  {errors.preference && <p className={styles.errMsg}>{errors.preference}</p>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Why do you want to join? <span className={styles.optional}>(optional)</span></label>
                  <textarea name="reason" value={form.reason} onChange={handleChange} rows={3}
                    placeholder="Tell us about your love for beef..."
                    className={styles.textarea} />
                </div>

                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Create Password <span className={styles.req}>*</span></label>
                    <input type="password" name="password" value={form.password} onChange={handleChange}
                      placeholder="Your login password" className={`${styles.input} ${errors.password ? styles.fieldError : ''}`} />
                    {errors.password && <p className={styles.errMsg}>{errors.password}</p>}
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Confirm Password <span className={styles.req}>*</span></label>
                    <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                      placeholder="Repeat password" className={`${styles.input} ${errors.confirmPassword ? styles.fieldError : ''}`} />
                    {errors.confirmPassword && <p className={styles.errMsg}>{errors.confirmPassword}</p>}
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '-0.5rem', marginBottom: '0.25rem' }}>
                  🔑 You'll use this password to log in to your member portal at <strong>/member/login</strong>
                </p>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <><Loader2 size={20} className={styles.spinner} /> Processing...</>
                  ) : (
                    <><Crown size={20} /> Claim My Membership</>
                  )}
                </button>
                <p className={styles.formNote}>✅ Completely free. No credit card required.</p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
