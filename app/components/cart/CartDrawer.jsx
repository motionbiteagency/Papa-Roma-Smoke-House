'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQty, getTotal, getCount } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isDrawerOpen ? styles.backdropVisible : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside 
        className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`} 
        aria-label="Shopping cart"
        data-lenis-prevent="true"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <ShoppingBag size={20} />
            <span className={styles.title}>Your Order</span>
            {getCount() > 0 && (
              <span className={styles.countBadge}>{getCount()}</span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={closeDrawer} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body} data-lenis-prevent="true">
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🛒</div>
              <h3 className={styles.emptyTitle}>Your order is empty</h3>
              <p className={styles.emptyText}>Browse our menus and add items to get started.</p>
              <Link href="/menu/smoke-house" className={styles.browseBtn} onClick={closeDrawer}>
                Browse Menus
              </Link>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {items.map(item => (
                <li key={item.id} className={styles.cartItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.menuTag}>{item.menuName}</span>
                    <p className={styles.itemName}>{item.name}</p>
                    <span className={styles.itemPrice}>৳{(item.price * item.quantity).toLocaleString()}</span>
                    {item.unit && <span className={styles.itemUnit}>{item.unit}</span>}
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.qtyControl}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal</span>
              <span className={styles.totalAmount}>৳{getTotal().toLocaleString()}</span>
            </div>
            <p className={styles.taxNote}>Delivery charges & taxes calculated at checkout</p>
            <Link
              href="/checkout"
              className={styles.checkoutBtn}
              onClick={closeDrawer}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
