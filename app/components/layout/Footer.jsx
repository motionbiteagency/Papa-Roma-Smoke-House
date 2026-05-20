'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Flame, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { usePublicData } from '@/app/context/PublicDataContext';
import styles from './Footer.module.css';

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

export default function Footer() {
  const { config } = usePublicData();
  const { restaurant = {}, navLinks = [] } = config;

  return (
    <footer className={styles.footer}>
      {/* Animated Glow Orb */}
      <div className={styles.glowOrb}></div>

      {/* Decorative top border */}
      <div className={styles.topBorder}></div>

      <div className={`container ${styles.footerContent}`}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Flame size={20} />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>PAPA ROMA</span>
              <span className={styles.logoSub}>FOOD ENGINEERING</span>
            </div>
          </Link>
          <p className={styles.brandDesc}>{restaurant.description}</p>
          <div className={styles.socials}>
            {restaurant.facebook && (
              <a href={restaurant.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <FacebookIcon size={18} />
              </a>
            )}
            {restaurant.instagram && (
              <a href={restaurant.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Quick Links</h4>
          <ul className={styles.colLinks}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.footerLink}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contact Us</h4>
          <ul className={styles.contactList}>
            <li>
              <MapPin size={16} className={styles.contactIcon} />
              <span>{restaurant.address}</span>
            </li>
            <li>
              <Phone size={16} className={styles.contactIcon} />
              <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
            </li>
            <li>
              <Mail size={16} className={styles.contactIcon} />
              <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
            </li>
            <li>
              <Clock size={16} className={styles.contactIcon} />
              <span>{restaurant.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} PAPA ROMA FOOD ENGINEERING. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
