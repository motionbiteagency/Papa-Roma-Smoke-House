'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { AnimateOnScroll } from '@/app/components/ui/AnimateOnScroll';
import { usePublicData } from '@/app/context/PublicDataContext';
import styles from './contact.module.css';

export default function ContactPage() {
  const { config } = usePublicData();
  const restaurant = config.restaurant || {};
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', eventType: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', eventType: '', message: '' });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
    setLoading(false);
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero */}
      <section className={styles.contactHero}>
        <div className="container">
          <span className="section-label">Get In Touch</span>
          <h1 className={styles.contactTitle}>Contact <span className="gold-text">Us</span></h1>
          <p className={styles.contactSubtitle}>We&apos;d love to hear from you — for reservations, events, or catering inquiries</p>
        </div>
      </section>

      <section className={`section ${styles.contactContent}`}>
        <div className="container">
          <div className={styles.contactGrid}>
            {/* Contact Info */}
            <AnimateOnScroll direction="left">
              <div className={styles.infoSection}>
                <h2 className={styles.infoTitle}>Visit <span className="gold-text">Papa Roma</span></h2>
                <div className={styles.infoCards}>
                  <div className={styles.infoCard}>
                    <MapPin size={20} className={styles.infoIcon} />
                    <div>
                      <h4>Location</h4>
                      <p>{restaurant.address}</p>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <Phone size={20} className={styles.infoIcon} />
                    <div>
                      <h4>Phone / WhatsApp</h4>
                      <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <Mail size={20} className={styles.infoIcon} />
                    <div>
                      <h4>Email</h4>
                      <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <Clock size={20} className={styles.infoIcon} />
                    <div>
                      <h4>Hours</h4>
                      <p>{restaurant.hours}</p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className={styles.mapWrapper}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.0!2d90.3754!3d23.7461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8a7a8c2e28d%3A0x0!2zMjPCsDQ0JzQ2LjAiTiA5MMKwMjInMzEuNCJF!5e0!3m2!1sen!2sbd!4v1600000000000"
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: 'var(--radius-md)' }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Papa Roma Location"
                  ></iframe>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Contact Form */}
            <AnimateOnScroll direction="right">
              <div className={styles.formSection}>
                {submitted ? (
                  <div className={styles.successMessage}>
                    <CheckCircle size={48} className={styles.successIcon} />
                    <h3>Thank You!</h3>
                    <p>Your inquiry has been submitted. We&apos;ll get back to you shortly.</p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <h3 className={styles.formTitle}>Send us a Message</h3>
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Full Name *</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="email">Email *</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="phone">Phone</label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+880 1XXX-XXXXXX"
                          className={styles.input}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="eventType">Inquiry Type</label>
                      <select
                        id="eventType"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        <option value="">Select a type</option>
                        <option value="reservation">Table Reservation</option>
                        <option value="catering">Catering Service</option>
                        <option value="event">Private Event</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us what you need..."
                        rows="5"
                        className={styles.textarea}
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Sending...' : <>Send Message <Send size={16} /></>}
                    </button>
                  </form>
                )}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}
