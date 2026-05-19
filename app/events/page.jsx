'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Users, User, Phone, Mail, MessageSquare,
  Star, CheckCircle, PartyPopper, ArrowLeft, Loader2, Sparkles
} from 'lucide-react';
import styles from './events.module.css';

const EVENT_TYPES = [
  { value: '', label: 'Select Event Type' },
  { value: 'birthday', label: '🎂 Birthday Party' },
  { value: 'anniversary', label: '💑 Anniversary Dinner' },
  { value: 'holud', label: '🌼 Holud Night' },
  { value: 'corporate', label: '💼 Corporate Party / Dinner' },
  { value: 'engagement', label: '💍 Engagement Ceremony' },
  { value: 'babyshower', label: '🍼 Baby Shower' },
  { value: 'reunion', label: '🤝 Family / Friend Reunion' },
  { value: 'other', label: '🎉 Other Private Event' },
];

const PAST_EVENTS = [
  {
    id: 1,
    type: 'Birthday Party',
    title: 'Spectacular Birthday Celebration',
    description: 'An unforgettable birthday evening with custom cake, floral setup, and a surprise performance. Guests were treated to our signature smoked platters.',
    guests: 45,
    image: '/images/event-birthday.png',
    badge: '🎂',
    rating: 5,
  },
  {
    id: 2,
    type: 'Anniversary Dinner',
    title: 'Romantic Anniversary Evening',
    description: 'A magical candlelit dinner for a couple celebrating 10 years together. Rose petal setup, premium menu, and a private corner with ambient music.',
    guests: 2,
    image: '/images/event-anniversary.png',
    badge: '💑',
    rating: 5,
  },
  {
    id: 3,
    type: 'Holud Night',
    title: 'Traditional Holud Celebration',
    description: 'A vibrant and joyful Holud Night with traditional Bengali decor, marigold arrangements, and a specially curated fusion menu combining tradition and flavor.',
    guests: 120,
    image: '/images/event-holud.png',
    badge: '🌼',
    rating: 5,
  },
  {
    id: 4,
    type: 'Corporate Dinner',
    title: 'Executive Corporate Dinner',
    description: 'A high-profile corporate networking dinner with a private hall setup, customized menu, and dedicated staff. The perfect setting for business and fine dining.',
    guests: 60,
    image: '/images/event-corporate.png',
    badge: '💼',
    rating: 5,
  },
];

const MIN_DAYS_AHEAD = 10;

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + MIN_DAYS_AHEAD);
  return d.toISOString().split('T')[0];
}

export default function EventsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    eventType: '',
    eventDate: '',
    guests: '',
    name: '',
    phone: '',
    email: '',
    instructions: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.eventType) e.eventType = 'Please select an event type.';
    if (!form.eventDate) {
      e.eventDate = 'Please select an event date.';
    } else if (form.eventDate < getMinDate()) {
      e.eventDate = `Event date must be at least ${MIN_DAYS_AHEAD} days from today.`;
    }
    if (!form.guests || parseInt(form.guests) < 1) e.guests = 'Please enter number of guests.';
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!form.phone.trim()) e.phone = 'Please enter your phone number.';
    if (!form.email.trim()) {
      e.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address.';
    }
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
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 4000);
      } else {
        const d = await res.json();
        alert(d.error || 'Something went wrong. Please try again.');
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
          <h1 className={styles.successTitle}>Booking Request Received! 🎉</h1>
          <p className={styles.successMsg}>
            Thank you, <strong>{form.name}</strong>! Your{' '}
            <strong>{EVENT_TYPES.find(e => e.value === form.eventType)?.label}</strong> on{' '}
            <strong>{new Date(form.eventDate).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>{' '}
            for <strong>{form.guests} guests</strong> has been recorded.
          </p>
          <p className={styles.successSub}>
            Our events team will contact you at <strong>{form.phone}</strong> within 24 hours to confirm your reservation.
          </p>
          <p className={styles.successRedirect}>Redirecting you to Home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <Image
          src="/images/event-hero-bg.png"
          alt="Event venue at Papa Roma"
          fill
          className={styles.heroBg}
          priority
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className={styles.heroBadge}>
            <PartyPopper size={18} />
            <span>Private Events & Celebrations</span>
          </div>
          <h1 className={styles.heroTitle}>
            Create <span className={styles.gold}>Unforgettable</span><br />
            Moments With Us
          </h1>
          <p className={styles.heroSubtitle}>
            From intimate anniversary dinners to grand corporate gatherings — let us craft the perfect experience for your special occasion in the heart of Dhaka.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><strong>500+</strong><span>Events Hosted</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>4.9★</strong><span>Avg. Rating</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>10K+</strong><span>Happy Guests</span></div>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className={styles.eventTypesSection}>
        <div className="container">
          <div className="section-header">
            <span className="section-label"><Sparkles size={14} /> What We Host</span>
            <h2 className="section-title">Every <span className="gold-text">Occasion</span> Deserves the Best</h2>
            <p className="section-subtitle">We specialize in hosting a wide variety of events with premium setups and curated menus.</p>
          </div>
          <div className={styles.eventTypeGrid}>
            {[
              { emoji: '🎂', title: 'Birthday Parties', desc: 'Custom cakes, floral setups & surprise elements to make every birthday magical.' },
              { emoji: '💑', title: 'Anniversaries', desc: 'Romantic candlelit dinners with rose petal decor and intimate ambiance.' },
              { emoji: '🌼', title: 'Holud Night', desc: 'Traditional Bengali elegance with marigold decor and fusion cuisine.' },
              { emoji: '💼', title: 'Corporate Events', desc: 'Professional setups for business dinners, team lunches, and networking.' },
              { emoji: '💍', title: 'Engagements', desc: 'Celebrate the beginning of a lifetime with a beautifully arranged ceremony.' },
              { emoji: '🎉', title: 'Private Parties', desc: 'Any special occasion deserves a unique celebration. We make it happen.' },
            ].map((ev) => (
              <div key={ev.title} className={styles.eventTypeCard}>
                <div className={styles.eventTypeEmoji}>{ev.emoji}</div>
                <h3 className={styles.eventTypeTitle}>{ev.title}</h3>
                <p className={styles.eventTypeDesc}>{ev.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className={styles.formSection} id="book">
        <div className={styles.formBg} />
        <div className="container">
          <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
              <div className={styles.formHeaderIcon}><Calendar size={28} /></div>
              <h2 className={styles.formTitle}>Book Your Event</h2>
              <p className={styles.formSubtitle}>Fill in the details below and our team will get back to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* Event Type */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <PartyPopper size={16} /> Event Type <span className={styles.required}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    name="eventType"
                    value={form.eventType}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.eventType ? styles.fieldError : ''}`}
                  >
                    {EVENT_TYPES.map(et => (
                      <option key={et.value} value={et.value}>{et.label}</option>
                    ))}
                  </select>
                </div>
                {errors.eventType && <p className={styles.errorMsg}>{errors.eventType}</p>}
              </div>

              <div className={styles.row}>
                {/* Event Date */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <Calendar size={16} /> Event Date <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={form.eventDate}
                    onChange={handleChange}
                    min={getMinDate()}
                    className={`${styles.input} ${errors.eventDate ? styles.fieldError : ''}`}
                  />
                  {errors.eventDate && <p className={styles.errorMsg}>{errors.eventDate}</p>}
                </div>

                {/* Guests */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <Users size={16} /> Number of Guests <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={form.guests}
                    onChange={handleChange}
                    min="1"
                    max="500"
                    placeholder="e.g. 50"
                    className={`${styles.input} ${errors.guests ? styles.fieldError : ''}`}
                  />
                  {errors.guests && <p className={styles.errorMsg}>{errors.guests}</p>}
                </div>
              </div>

              <div className={styles.row}>
                {/* Name */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <User size={16} /> Your Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className={`${styles.input} ${errors.name ? styles.fieldError : ''}`}
                  />
                  {errors.name && <p className={styles.errorMsg}>{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <Phone size={16} /> Phone Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+880 1XXXXXXXXX"
                    className={`${styles.input} ${errors.phone ? styles.fieldError : ''}`}
                  />
                  {errors.phone && <p className={styles.errorMsg}>{errors.phone}</p>}
                </div>
              </div>

              {/* Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <Mail size={16} /> Email Address <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`${styles.input} ${errors.email ? styles.fieldError : ''}`}
                />
                {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
              </div>

              {/* Special Instructions */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <MessageSquare size={16} /> Special Instructions <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us more — decoration preferences, dietary needs, theme, or any special requests..."
                  className={styles.textarea}
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className={styles.spinner} />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Calendar size={20} />
                    Confirm Booking Request
                  </>
                )}
              </button>

              <p className={styles.formNote}>
                ✅ No payment required now. Our team will confirm availability and discuss pricing with you directly.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className={`section ${styles.pastEventsSection}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-label"><Star size={14} /> Our Work</span>
            <h2 className="section-title">Events We've <span className="gold-text">Celebrated</span></h2>
            <p className="section-subtitle">A glimpse into some of the beautiful moments we've helped create for our guests.</p>
          </div>
          <div className={styles.pastEventsGrid}>
            {PAST_EVENTS.map(ev => (
              <div key={ev.id} className={styles.pastEventCard}>
                <div className={styles.pastEventImageWrapper}>
                  <Image
                    src={ev.image}
                    alt={ev.title}
                    fill
                    className={styles.pastEventImage}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className={styles.pastEventOverlay} />
                  <div className={styles.pastEventBadge}>{ev.badge} {ev.type}</div>
                  <div className={styles.pastEventRating}>
                    {Array.from({ length: ev.rating }).map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <div className={styles.pastEventContent}>
                  <h3 className={styles.pastEventTitle}>{ev.title}</h3>
                  <p className={styles.pastEventDesc}>{ev.description}</p>
                  <div className={styles.pastEventMeta}>
                    <span><Users size={14} /> {ev.guests} Guests</span>
                    <span><CheckCircle size={14} /> Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.pastEventsCta}>
            <p>Ready to create your own unforgettable memory?</p>
            <a href="#book" className="btn btn-primary">Book Your Event Now</a>
          </div>
        </div>
      </section>
    </div>
  );
}
