'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Check, ShieldCheck, ChevronRight, Leaf } from 'lucide-react';
import { RESTAURANT_INFO } from '@/lib/constants';
import styles from './medicinal.module.css';

const PLANS = [
  {
    id: 'diabetic',
    name: 'Diabetic Meal Plan',
    tagline: 'Low-GI, Blood Sugar Friendly',
    price: '৳2,200',
    per: '/ week',
    highlight: false,
    features: [
      'Low glycemic index ingredients',
      'Zero refined sugar, zero white rice',
      'High-fiber vegetables & whole grains',
      'Controlled carbohydrate portions',
      '4 meals/day with balanced macros',
    ],
  },
  {
    id: 'low-sodium',
    name: 'Heart & Hypertension Plan',
    tagline: 'Low-Sodium, Heart-Healthy',
    price: '৳2,400',
    per: '/ week',
    highlight: true,
    features: [
      'Strictly low-sodium cooking',
      'Heart-healthy fats (omega-3 rich)',
      'Steamed & baked — never fried',
      'Potassium-rich vegetables & fruits',
      'Cholesterol-conscious meal design',
    ],
  },
  {
    id: 'recovery',
    name: 'Post-Surgery Recovery Plan',
    tagline: 'Soft, Easily Digestible Meals',
    price: '৳2,600',
    per: '/ week',
    highlight: false,
    features: [
      'Soft-cooked, easy-to-digest foods',
      'High protein for tissue repair',
      'Anti-inflammatory ingredients',
      'Gentle on the digestive system',
      'Customized per surgery type',
    ],
  },
];

const CONDITIONS = [
  { icon: '🩺', name: 'Type 2 Diabetes', desc: 'Low-GI meals that keep blood sugar stable throughout the day.' },
  { icon: '❤️', name: 'Hypertension', desc: 'Low-sodium, heart-healthy meals to support blood pressure management.' },
  { icon: '🏥', name: 'Post-Surgery Recovery', desc: 'Soft, protein-rich meals to support healing and tissue regeneration.' },
  { icon: '🌿', name: 'Digestive Disorders', desc: 'Gentle, easy-to-digest meals for IBS, gastritis, or bowel conditions.' },
  { icon: '🦴', name: 'Bone & Joint Health', desc: 'Calcium and vitamin D-rich meals for osteoporosis and joint care.' },
  { icon: '⚖️', name: 'Obesity Management', desc: 'Calorie-controlled, nutrient-dense meals for medically supervised weight loss.' },
];

export default function MedicinalDietPage() {
  const [form, setForm] = useState({ name: '', phone: '', plan: 'diabetic', condition: '', doctorNote: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hi Papa Roma! I'm interested in the Medicinal Diet Plan.\n\n` +
      `Name: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      `Selected Plan: ${PLANS.find(p => p.id === form.plan)?.name}\n` +
      `Health Condition: ${form.condition}\n` +
      `Doctor's Notes / Special Requirements: ${form.doctorNote || 'None provided'}`
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
            <Leaf size={14} /> Therapeutic Nutrition
          </div>
          <h1 className={styles.heroTitle}>
            Healing Through <span className={styles.accent}>Food</span>
          </h1>
          <p className={styles.heroDesc}>
            Doctor-aware, therapeutic meal plans designed for people managing health conditions.
            Food that nourishes, soothes, and heals — crafted with care.
          </p>
          <div className={styles.disclaimer}>
            <ShieldCheck size={14} />
            These plans complement your doctor's advice — not a substitute for medical consultation.
          </div>
          <a href="#inquiry" className={`btn ${styles.heroBtn}`}>
            Inquire Now <ChevronRight size={16} />
          </a>
        </div>
      </section>

      {/* Conditions We Support */}
      <section className={`section ${styles.conditionsSection}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Conditions We Serve</span>
            <h2 className="section-title">Meals Designed for <span className="gold-text">Your Health</span></h2>
            <p className="section-subtitle">Our kitchen works alongside your healthcare plan to provide the right nutrition</p>
          </div>
          <div className={styles.conditionsGrid}>
            {CONDITIONS.map((c) => (
              <div key={c.name} className={styles.conditionCard}>
                <div className={styles.conditionIcon}>{c.icon}</div>
                <h3 className={styles.conditionName}>{c.name}</h3>
                <p className={styles.conditionDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className={`section ${styles.plansSection}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Therapeutic Meal Plans</span>
            <h2 className="section-title">Choose Your <span className="gold-text">Plan</span></h2>
            <p className="section-subtitle">All plans are freshly prepared with therapeutic ingredients. Custom plans available on consultation.</p>
          </div>
          <div className={styles.plansGrid}>
            {PLANS.map((plan) => (
              <div key={plan.id} className={`${styles.planCard} ${plan.highlight ? styles.planHighlight : ''}`}>
                {plan.highlight && <div className={styles.popularBadge}>Recommended</div>}
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planTagline}>{plan.tagline}</p>
                  <div className={styles.planPrice}>
                    <span className={styles.priceAmount}>{plan.price}</span>
                    <span className={styles.pricePer}>{plan.per}</span>
                  </div>
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
                  Choose This Plan
                </button>
              </div>
            ))}
          </div>
          {/* Disclaimer Card */}
          <div className={styles.disclaimerCard}>
            <ShieldCheck size={20} className={styles.disclaimerIcon} />
            <p>
              <strong>Medical Disclaimer:</strong> These meal plans are designed to complement and support — not replace — medical treatment or professional dietary advice. Always consult your physician or registered dietitian before starting any therapeutic meal plan. Our team will work in harmony with your healthcare provider's guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className={`section ${styles.formSection}`}>
        <div className="container">
          <div className={styles.formGrid}>
            <div className={styles.formInfo}>
              <span className="section-label">Start Your Journey</span>
              <h2 className={styles.formTitle}>Let's Craft Your <span className={styles.accent}>Plan</span></h2>
              <p className={styles.formDesc}>
                Share your health condition and we'll connect via WhatsApp to understand your needs and tailor the perfect therapeutic meal plan for you.
              </p>
              <div className={styles.formHighlights}>
                <div className={styles.highlight}><Check size={14} /> Fully customizable to your condition</div>
                <div className={styles.highlight}><Check size={14} /> Doctor's notes accommodated</div>
                <div className={styles.highlight}><Check size={14} /> Weekly delivery or pickup</div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="med-name">Full Name</label>
                <input id="med-name" type="text" placeholder="Your name" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="med-phone">Phone / WhatsApp</label>
                <input id="med-phone" type="tel" placeholder="+880 1X XX-XXXXXX" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="med-plan">Select Plan</label>
                <select id="med-plan" value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
                  <option value="diabetic">Diabetic Meal Plan — ৳2,200/week</option>
                  <option value="low-sodium">Heart & Hypertension Plan — ৳2,400/week</option>
                  <option value="recovery">Post-Surgery Recovery — ৳2,600/week</option>
                  <option value="custom">Custom Plan (Consultation Required)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="med-condition">Health Condition</label>
                <input id="med-condition" type="text" placeholder="e.g. Type 2 Diabetes, post-surgery" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="med-note">Doctor's Dietary Notes (optional)</label>
                <input id="med-note" type="text" placeholder="Any specific restrictions from your doctor" value={form.doctorNote} onChange={e => setForm(p => ({ ...p, doctorNote: e.target.value }))} />
              </div>
              <div className={styles.formDisclaimer}>
                <Heart size={12} /> These plans complement — not replace — your doctor's advice.
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
