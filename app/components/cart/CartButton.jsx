'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import styles from './CartButton.module.css';

export default function CartButton() {
  const { getCount, toggleDrawer } = useCart();
  const count = getCount();

  return (
    <button
      className={styles.cartBtn}
      onClick={toggleDrawer}
      aria-label={`Open cart, ${count} items`}
    >
      <ShoppingBag size={22} />
      {count > 0 && (
        <span className={styles.badge}>{count > 99 ? '99+' : count}</span>
      )}
    </button>
  );
}
