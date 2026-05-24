'use client';

import { Loader2, Flame } from 'lucide-react';
import styles from './AdminLoading.module.css';

export default function AdminLoading({ text = "Loading Data..." }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingPulse}>
        <Flame className={styles.flameIcon} size={42} />
      </div>
      <div className={styles.loadingTextContainer}>
        <Loader2 className={styles.spinner} size={18} />
        <span className={styles.loadingText}>{text}</span>
      </div>
    </div>
  );
}
