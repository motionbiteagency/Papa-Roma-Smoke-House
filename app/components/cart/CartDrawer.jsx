'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import styles from './CartDrawer.module.css';

const ORDER_TYPES = [
  { value: 'DINE_IN',  label: 'Dine-in',  emoji: '🍽️' },
  { value: 'TAKEAWAY', label: 'Takeaway', emoji: '🥡' },
  { value: 'DELIVERY', label: 'Delivery', emoji: '🛵' },
];

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQty, getTotal, getCount, clearCart } = useCart();

  // step: 'cart' | 'checkout' | 'success'
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState({ name: '', phone: '', email: '', type: 'DINE_IN', table: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  // Reset to cart step whenever drawer closes
  useEffect(() => {
    if (!isDrawerOpen) {
      setTimeout(() => { setStep('cart'); setFormError(''); }, 350); // after slide-out animation
    }
  }, [isDrawerOpen]);

  // Lock body scroll + stop Lenis when drawer open
  useEffect(() => {
    if (isDrawerOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      window.__lenis?.stop();
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.__lenis?.start();
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.__lenis?.start();
    };
  }, [isDrawerOpen]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePlaceOrder = async () => {
    setFormError('');
    if (!form.name.trim())  { setFormError('Please enter your name.');         return; }
    if (!form.phone.trim()) { setFormError('Please enter your phone number.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:  form.name.trim(),
          customerPhone: form.phone.trim(),
          customerEmail: form.email.trim() || null,
          type:          form.type,
          tableNumber:   form.table.trim() || null,
          notes:         form.notes.trim() || null,
          items: items.map(i => ({
            id:       i.id,
            name:     i.name,
            price:    i.price,
            quantity: i.quantity,
            menuName: i.menuName || '',
            unit:     i.unit || '',
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error || 'Failed to place order. Please try again.');
        return;
      }
      setOrderNumber(json.orderNumber);
      clearCart();
      setStep('success');
    } catch {
      setFormError('No internet connection. Please check your network.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    closeDrawer();
    setForm({ name: '', phone: '', email: '', type: 'DINE_IN', table: '', notes: '' });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isDrawerOpen ? styles.backdropVisible : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}
        aria-label="Shopping cart"
        data-lenis-prevent="true"
      >
        {/* ═══ STEP: CART ═══════════════════════════════════════ */}
        {step === 'cart' && (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <ShoppingBag size={20} />
                <span className={styles.title}>Your Order</span>
                {getCount() > 0 && <span className={styles.countBadge}>{getCount()}</span>}
              </div>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close cart">
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
                  <Link href="/menu/smoke-house" className={styles.browseBtn} onClick={handleClose}>
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
                          <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity - 1)} aria-label="Decrease">
                            <Minus size={14} />
                          </button>
                          <span className={styles.qty}>{item.quantity}</span>
                          <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity + 1)} aria-label="Increase">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Remove">
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
                <p className={styles.taxNote}>{items.length} item{items.length !== 1 ? 's' : ''} · taxes included</p>
                <Link href="/checkout" className={styles.checkoutBtn} onClick={handleClose}>
                  Place Order →
                </Link>
              </div>
            )}
          </>
        )}

        {/* ═══ STEP: CHECKOUT ═══════════════════════════════════ */}
        {step === 'checkout' && (
          <>
            {/* Header */}
            <div className={styles.header}>
              <button className={styles.backBtn} onClick={() => setStep('cart')} aria-label="Back to cart">
                <ArrowLeft size={18} />
              </button>
              <span className={styles.title} style={{ flex: 1 }}>Your Details</span>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* Body — checkout form */}
            <div className={styles.body} data-lenis-prevent="true">
              <div className={styles.checkoutForm}>

                {/* Order type selector */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Order Type</label>
                  <div className={styles.typeSelector}>
                    {ORDER_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        className={`${styles.typeBtn} ${form.type === t.value ? styles.typeBtnActive : ''}`}
                        onClick={() => setField('type', t.value)}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Full Name <span className={styles.required}>*</span></label>
                  <input
                    className={styles.fieldInput}
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Phone <span className={styles.required}>*</span></label>
                  <input
                    className={styles.fieldInput}
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                  />
                </div>

                {/* Table (dine-in only) */}
                {form.type === 'DINE_IN' && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Table Number</label>
                    <input
                      className={styles.fieldInput}
                      placeholder="e.g. 5"
                      value={form.table}
                      onChange={e => setField('table', e.target.value)}
                    />
                  </div>
                )}

                {/* Email */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Email <span className={styles.optional}>(optional)</span></label>
                  <input
                    className={styles.fieldInput}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Special Notes <span className={styles.optional}>(optional)</span></label>
                  <textarea
                    className={styles.fieldInput}
                    rows={3}
                    placeholder="Allergies, special requests…"
                    value={form.notes}
                    onChange={e => setField('notes', e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>

                {/* Order summary mini */}
                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                    <span className={styles.summaryTotal}>৳{getTotal().toLocaleString()}</span>
                  </div>
                </div>

                {/* Error */}
                {formError && (
                  <p className={styles.formError}>⚠ {formError}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <button
                className={styles.checkoutBtn}
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting
                  ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Placing Order…</>
                  : `Confirm Order · ৳${getTotal().toLocaleString()}`}
              </button>
            </div>
          </>
        )}

        {/* ═══ STEP: SUCCESS ════════════════════════════════════ */}
        {step === 'success' && (
          <>
            <div className={styles.header}>
              <span className={styles.title} style={{ flex: 1 }}>Order Placed!</span>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className={styles.body} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className={styles.successState}>
                <CheckCircle size={56} className={styles.successIcon} />
                <h3 className={styles.successTitle}>Thank you!</h3>
                <p className={styles.successSub}>Your order has been received.</p>
                <div className={styles.orderNumberBadge}>
                  Order #{orderNumber}
                </div>
                <p className={styles.successNote}>
                  Please show this number to our staff. We'll have your order ready shortly.
                </p>
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.checkoutBtn} onClick={handleClose}>
                Done
              </button>
            </div>
          </>
        )}
      </aside>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
