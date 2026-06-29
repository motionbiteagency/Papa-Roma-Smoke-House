'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Dumbbell, Check, Flame, Scale, ChevronRight } from 'lucide-react';
import { RESTAURANT_INFO } from '@/lib/constants';
import styles from './gym.module.css';

const PLANS = [
  {
    id: 'bulking',
    name: 'Bulking Plan',
    tagline: 'Maximum Muscle Gain',
    price: '৳2,800',
    per: '/ week',
    calories: '3,200–3,800 kcal',
    protein: '180–220g protein',
    highlight: true,
    features: [
      'High-calorie, high-protein portions',
      'Brown rice, oats & complex carbs',
      'Grilled chicken, beef & egg whites',
      'Pre & post-workout meal timing',
      '5 meals per day, portioned by gram',
    ],
  },
  {
    id: 'cutting',
    name: 'Cutting Plan',
    tagline: 'Lean & Defined',
    price: '৳2,500',
    per: '/ week',
    calories: '1,800–2,200 kcal',
    protein: '160–200g protein',
    highlight: false,
    features: [
      'Calorie-deficit precision meals',
      'Low carb, high protein balance',
      'Grilled fish, chicken & vegetables',
      'Zero fried food, zero added sugar',
      '4 meals per day, weighed portions',
    ],
  },
  {
    id: 'maintenance',
    name: 'Maintenance Plan',
    tagline: 'Stay Strong & Energized',
    price: '৳2,200',
    per: '/ week',
    calories: '2,400–2,800 kcal',
    protein: '140–170g protein',
    highlight: false,
    features: [
      'Balanced macro distribution',
      'Lean proteins & whole grains',
      'Mixed vegetable sides every meal',
      'Sustainable, long-term nutrition',
      '4 meals per day, portioned servings',
    ],
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose Your Plan',
    desc: 'Select the plan that matches your fitness goal — bulking, cutting, or maintenance.',
  },
  {
    step: '02',
    title: 'Fill the Inquiry Form',
    desc: 'Tell us your weight, goal, and any dietary restrictions. We customize accordingly.',
  },
  {
    step: '03',
    title: 'Receive Your Meals',
    desc: 'Fresh, weighed & packed meals delivered or ready for pickup daily or weekly.',
  },
];

export default function GymFoodPage() {
  const [form, setForm] = useState({ name: '', phone: '', plan: 'bulking', weight: '', goal: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hi Papa Roma! I'm interested in the Gym Fitness Meal Plan.\n\n` +
      `Name: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      `Plan: ${form.plan.charAt(0).toUpperCase() + form.plan.slice(1)} Plan\n` +
      `Current Weight: ${form.weight}\n` +
      `Fitness Goal: ${form.goal}`
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
            <Dumbbell size={14} /> Fitness Nutrition
          </div>
          <h1 className={styles.heroTitle}>
            Fuel Your <span className={styles.accent}>Gains</span>
          </h1>
          <p className={styles.heroDesc}>
            Precision-portioned, macro-balanced meals crafted for athletes and gym enthusiasts.
            Every gram counts — so we count every gram.
          </p>
          <a href="#inquiry" className={`btn ${styles.heroBtn}`}>
            Get My Plan <ChevronRight size={16} />
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.stat}><Scale size={20} /><span>Weighed to the Gram</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><Flame size={20} /><span>Fresh Daily Prep</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><Dumbbell size={20} /><span>3 Goal-Specific Plans</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><Check size={20} /><span>No Junk, No Compromise</span></div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <section className={`section ${styles.plansSection}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Choose Your Goal</span>
            <h2 className="section-title">Meal <span className="gold-text">Plans</span></h2>
            <p className="section-subtitle">All meals are freshly prepared, weighed, and packed for optimal nutrition</p>
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
                  <div className={styles.planMacros}>
                    <span>{plan.calories}</span>
                    <span className={styles.macroDivider}>·</span>
                    <span>{plan.protein}</span>
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
                  Order This Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howSection}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Simple Process</span>
            <h2 className="section-title">How It <span className="gold-text">Works</span></h2>
          </div>
          <div className={styles.stepsGrid}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.step}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
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
              <span className="section-label">Get Started</span>
              <h2 className={styles.formTitle}>Ready to <span className={styles.accent}>Transform?</span></h2>
              <p className={styles.formDesc}>
                Fill out the form and we'll connect you via WhatsApp to finalize your custom meal plan.
              </p>
              <div className={styles.formHighlights}>
                <div className={styles.highlight}><Check size={14} /> Custom portions based on your weight</div>
                <div className={styles.highlight}><Check size={14} /> Dietary restriction accommodated</div>
                <div className={styles.highlight}><Check size={14} /> Weekly or monthly subscription</div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="gym-name">Full Name</label>
                <input id="gym-name" type="text" placeholder="Your name" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="gym-phone">Phone / WhatsApp</label>
                <input id="gym-phone" type="tel" placeholder="+880 1X XX-XXXXXX" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="gym-plan">Select Plan</label>
                <select id="gym-plan" value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
                  <option value="bulking">Bulking Plan — ৳2,800/week</option>
                  <option value="cutting">Cutting Plan — ৳2,500/week</option>
                  <option value="maintenance">Maintenance Plan — ৳2,200/week</option>
                </select>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="gym-weight">Current Weight (kg)</label>
                  <input id="gym-weight" type="text" placeholder="e.g. 75 kg" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="gym-goal">Fitness Goal</label>
                  <input id="gym-goal" type="text" placeholder="e.g. Lose 10kg" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} />
                </div>
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
