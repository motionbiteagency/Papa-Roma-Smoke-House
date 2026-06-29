'use client';

import Image from 'next/image';
import { AnimateOnScroll } from '../components/ui/AnimateOnScroll';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <main className={`section ${styles.about}`}>
      <div className="container">
        <div className="section-header">
          <span className="section-label">About Us</span>
          <h1 className="section-title">The Art of <span className="gold-text">Smoke</span></h1>
        </div>
        
        <div className={styles.aboutGrid}>
          <AnimateOnScroll direction="left" className={styles.aboutImage}>
            <div className={styles.aboutImageInner}>
              <Image
                src="/images/about-cooking.png"
                alt="Chef smoking meat at Papa Roma"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className={styles.aboutImageOverlay}></div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll direction="right" className={styles.aboutContent}>
            <p className={styles.aboutText}>
              Nestled beside the serene Dhanmondi Lake, Papa Roma Smoke House brings you an extraordinary dining experience where traditional smoking techniques meet bold, contemporary flavors.
            </p>
            <p className={styles.aboutText}>
              Our pitmasters slow-smoke premium meats for hours using aged hardwood, creating tender, flavorful dishes that tell a story of patience and passion. From our signature Texas-style brisket to authentic Bengali specialties at Bangla Kutir, every bite is a journey.
            </p>
            <div className={styles.aboutFeatures}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🔥</div>
                <div><h4>Wood-Fired</h4><p>Aged hardwood smoking</p></div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🥩</div>
                <div><h4>Premium Cuts</h4><p>Hand-selected meats</p></div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🌿</div>
                <div><h4>Fresh Spices</h4><p>Locally sourced ingredients</p></div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </main>
  );
}
