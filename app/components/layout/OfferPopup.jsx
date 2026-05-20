'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { usePublicData } from '@/app/context/PublicDataContext';
import styles from './OfferPopup.module.css';

export default function OfferPopup() {
  const { config } = usePublicData();
  const [isVisible, setIsVisible] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
    const popupOffer = config.popupOffer;
    
    if (!popupOffer?.enabled) return;

    // Check if it's already been closed in this session
    const hasSeenPopup = sessionStorage.getItem('hasSeenOfferPopup');
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, (popupOffer.delaySeconds || 15) * 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenOfferPopup', 'true');
  };

  const handleLinkClick = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenOfferPopup', 'true');
  };

  if (!hasHydrated || !isVisible) return null;

  const popupOffer = config.popupOffer || {};

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close popup">
          <X size={20} />
        </button>
        
        {popupOffer.image && (
          <div className={styles.imageContainer}>
            <img src={popupOffer.image} alt={popupOffer.title} className={styles.image} />
          </div>
        )}
        
        <div className={styles.content}>
          <h3 className={styles.title}>{popupOffer.title}</h3>
          <p className={styles.subtitle}>{popupOffer.subtitle}</p>
          
          <Link href={popupOffer.link} className={styles.button} onClick={handleLinkClick}>
            {popupOffer.buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
