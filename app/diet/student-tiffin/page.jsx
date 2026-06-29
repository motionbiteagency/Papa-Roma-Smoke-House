'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Check, Star, ChevronRight, Apple } from 'lucide-react';
import { RESTAURANT_INFO } from '@/lib/constants';
import styles from './tiffin.module.css';

const PLANS = [
  {
    id: 'primary',
    name: 'Little Champions',
    tagline: 'Ages 6–11 (Primary School)',
    price: '৳180',
    per: '/ day',
    monthly: '৳3,800/month',
    highlight: false,
    features: [
      'Age-appropriate portion sizes',
      'Soft rice, dal & vegetables',
      ' 1 protein (egg/chicken) per box',
      'Fresh seasonal fruits included',
      'No excess spice or oil',
    ],
  },
  {
    id: 'secondary',
    name: 'Growing Stars',
    tagline: 'Ages 12–17 (Secondary School)',
    price: '৳220',
    per: '/ day',
    monthly: '৳4,500/month',
    highlight: true,
    features: [
      'Higher calorie for active teens',
      'Balanced rice, protein & greens',
      'Varied weekly menu (no repeats)',
      'Brain-boosting omega-3 sources',
      'Calcium-rich sides for bone growth',
    ],
  },
  {
    id: 'custom',
    name: 'Custom Care Box',
    tagline: 'Any age, special needs',
    price: '৳250',
    per: '/ day',
    monthly: '৳5,200/month',
    highlight: false,
    features: [
      'Fully customizable menu',
      'Allergy-safe preparation',
      'No nuts / no dairy options',
      'Doctor-recommended nutrition',
      'Parent-approved weekly plan',
    ],
  },
];

const WEEKLY_MENU = [
  { day: 'Saturday', items: 'Khichuri, Egg Bhaji, Salad + Banana' },
  { day: 'Sunday', items: 'Plain Rice, Dal, Chicken Curry + Orange' },
  { day: 'Monday', items: 'Roti, Sabji, Egg Omelette + Apple' },
  { day: 'Tuesday', items: 'Rice, Lentil Soup, Fish Curry + Guava' },
  { day: 'Wednesday', items: 'Fried Rice (light), Chicken Stir-Fry + Banana' },
  { day: 'Thursday', items: 'Rice, Mixed Vegetables, Beef Keema + Seasonal Fruit' },
];

export default function StudentTiffinPage() {
  const [form, setForm] = useState({ name: '', phone: '', plan: 'primary', childAge: '', allergies: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hi Papa Roma! I'm interested in the Student Tiffin Plan.\n\n` +
      `Parent Name: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      `Plan: ${PLANS.find(p => p.id === form.plan)?.name}\n` +
      `Child's Age: ${form.childAge}\n` +
      `Allergies / Notes: ${form.allergies || 'None'}`
    );
    window.open(`https://wa.me/${RESTAURANT_INFO.whatsapp}?text=${msg}`, '_blank');
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className={styles.heroBadge}>
            <BookOpen size={14} /> Student Nutrition
          </div>
          <h1 className={styles.heroTitle}>
            Nourish Their <span className={styles.accent}>Growth</span>
          </h1>
          <p className={styles.heroDesc}>
            Wholesome, parent-approved tiffin boxes crafted for growing minds and bodies.
            Fresh, balanced meals — delivered to school or ready for pickup.
          </p>
          <a href="#inquiry" className={`btn ${styles.heroBtn}`}>
            Subscribe Now <ChevronRight size={16} />
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.stat}><Apple size={20} /><span>Fresh Daily Prep</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><Check size={20} /><span>Zero Junk Food</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><Star size={20} /><span>Parent-Approved Menu</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><BookOpen size={20} /><span>Age-Specific Portions</span></div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <section className={`section ${styles.plansSection}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Tiffin Subscriptions</span>
            <h2 className="section-title">Choose a <span className="gold-text">Plan</span></h2>
            <p className="section-subtitle">All tiffin boxes are freshly prepared each morning with locally sourced ingredients</p>
          </div>
          <div className={styles.plansGrid}>
            {PLANS.map((plan) => (
              <div key={plan.id} className={`${styles.planCard} ${plan.highlight ? styles.planHighlight : ''}`}>
                {plan.highlight && <div className={styles.popularBadge}>Most Popular</div>}
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planTagline}>{plan.tagline}</p>
                  <div className={styles.planPrice}>
                    <span className={styles.priceAmount}>{plan.price}</span>
                    <span className={styles.pricePer}>{plan.per}</span>
                  </div>
                  <div className={styles.planMonthly}>{plan.monthly}</div>
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, i) => (
                    <li key={i} className={styles.planFeature}>
                      <Check size={14} className={styles.checkIcon} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`${styles.planBtn} ${plan.highlight ? styles.planBtnHighlight : ''}`}
                  onClick={() => {
                    setForm(prev => ({ ...prev, plan: plan.id }));
                    document.getElementById('inquiry').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Subscribe to This Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Weekly Menu */}
      <section className={styles.menuSection}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Sample Menu</span>
            <h2 className="section-title">A Week of <span className="gold-text">Wholesome</span> Meals</h2>
            <p className="section-subtitle">Menus rotate weekly so your child enjoys variety every day</p>
          </div>
          <div className={styles.menuGrid}>
            {WEEKLY_MENU.map((item) => (
              <div key={item.day} className={styles.menuCard}>
                <div className={styles.menuDay}>{item.day}</div>
                <p className={styles.menuItems}>{item.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className={`section ${styles.formSection}`}>
        <div className="container">
          <div className={styles.formGrid}>
            <div className={styles.formInfo}>
              <span className="section-label">Enroll Your Child</span>
              <h2 className={styles.formTitle}>Start the <span className={styles.accent}>Journey</span></h2>
              <p className={styles.formDesc}>
                Fill in the details and we'll contact you on WhatsApp to confirm your tiffin subscription and delivery/pickup arrangements.
              </p>
              <div className={styles.formHighlights}>
                <div className={styles.highlight}><Check size={14} /> Weekly or monthly subscription</div>
                <div className={styles.highlight}><Check size={14} /> Allergy & dietary customization</div>
                <div className={styles.highlight}><Check size={14} /> Pause or cancel anytime</div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="tiffin-name">Parent / Guardian Name</label>
                <input id="tiffin-name" type="text" placeholder="Your name" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="tiffin-phone">Phone / WhatsApp</label>
                <input id="tiffin-phone" type="tel" placeholder="+880 1X XX-XXXXXX" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="tiffin-plan">Select Plan</label>
                <select id="tiffin-plan" value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
                  <option value="primary">Little Champions (Ages 6–11) — ৳180/day</option>
                  <option value="secondary">Growing Stars (Ages 12–17) — ৳220/day</option>
                  <option value="custom">Custom Care Box — ৳250/day</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="tiffin-age">Child's Age & Grade</label>
                <input id="tiffin-age" type="text" placeholder="e.g. 9 years, Grade 4" value={form.childAge} onChange={e => setForm(p => ({ ...p, childAge: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="tiffin-allergies">Allergies / Dietary Notes (optional)</label>
                <input id="tiffin-allergies" type="text" placeholder="e.g. No nuts, no seafood" value={form.allergies} onChange={e => setForm(p => ({ ...p, allergies: e.target.value }))} />
              </div>
              <button type="submit" className={styles.submitBtn}>
                Send via WhatsApp <ChevronRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
