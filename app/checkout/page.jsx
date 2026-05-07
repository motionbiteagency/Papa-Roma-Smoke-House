'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import siteConfig from '@/data/siteConfig.json';
import styles from './checkout.module.css';

function buildWhatsAppMessage(form, items, total) {
  const itemLines = items
    .map(i => `  • ${i.name}${i.unit ? ` (${i.unit})` : ''} x${i.quantity} — ৳${(i.price * i.quantity).toLocaleString()}`)
    .join('\n');

  const lines = [
    `🍽️ *NEW ORDER — PAPA ROMA FOOD ENGINEERING*`,
    ``,
    `👤 *Name:* ${form.name}`,
    `📞 *Phone:* ${form.phone}`,
    `🚚 *Type:* ${form.orderType === 'delivery' ? 'Delivery' : 'Pickup'}`,
    form.orderType === 'delivery' ? `📍 *Address:* ${form.address}` : null,
    ``,
    `---`,
    `🛒 *ORDER ITEMS:*`,
    itemLines,
    `---`,
    ``,
    `💰 *TOTAL:* ৳${total.toLocaleString()}`,
    form.notes ? `📝 *Notes:* ${form.notes}` : null,
    ``,
    `✅ Please confirm this order!`,
  ]
    .filter(l => l !== null)
    .join('\n');

  return `https://wa.me/${siteConfig.restaurant.whatsapp}?text=${encodeURIComponent(lines)}`;
}

export default function CheckoutPage() {
  const { items, getTotal, updateQty, removeItem, clearCart } = useCart();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    orderType: 'delivery',
    address: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid =
    form.name.trim() &&
    form.phone.trim() &&
    (form.orderType === 'pickup' || form.address.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || items.length === 0) return;
    const url = buildWhatsAppMessage(form, items, getTotal());
    window.open(url, '_blank');
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>🎉</div>
          <h1 className={styles.successTitle}>Order Sent!</h1>
          <p className={styles.successText}>
            Your order has been sent to our WhatsApp. We will confirm it shortly!
          </p>
          <Link href="/" className={styles.successBtn}>Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      {/* Header */}
      <div className={styles.checkoutHeader}>
        <div className="container">
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Menu
          </Link>
          <h1 className={styles.pageTitle}>Checkout</h1>
          <p className={styles.pageSubtitle}>Review your order and fill in your details</p>
        </div>
      </div>

      <div className="container">
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={48} opacity={0.3} />
            <h2>Your cart is empty</h2>
            <p>Add some items from our menus first.</p>
            <Link href="/menu/smoke-house" className={styles.browseBtn}>Browse Menus</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Form */}
            <form className={styles.form} onSubmit={handleSubmit}>
              <h2 className={styles.formTitle}>Your Details</h2>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Rahim Uddin"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={styles.input}
                  placeholder="e.g. 01711-123456"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Order Type *</label>
                <div className={styles.radioGroup}>
                  <label className={`${styles.radioCard} ${form.orderType === 'delivery' ? styles.radioCardActive : ''}`}>
                    <input
                      type="radio"
                      name="orderType"
                      value="delivery"
                      checked={form.orderType === 'delivery'}
                      onChange={handleChange}
                      hidden
                    />
                    <span>🚚 Delivery</span>
                  </label>
                  <label className={`${styles.radioCard} ${form.orderType === 'pickup' ? styles.radioCardActive : ''}`}>
                    <input
                      type="radio"
                      name="orderType"
                      value="pickup"
                      checked={form.orderType === 'pickup'}
                      onChange={handleChange}
                      hidden
                    />
                    <span>🏃 Pickup</span>
                  </label>
                </div>
              </div>

              {form.orderType === 'delivery' && (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="address">Delivery Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    className={styles.textarea}
                    placeholder="House no, Road, Area, Dhaka"
                    rows={3}
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="notes">Special Instructions</label>
                <textarea
                  id="notes"
                  name="notes"
                  className={styles.textarea}
                  placeholder="Allergies, extra sauce, spice level..."
                  rows={2}
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!isValid || items.length === 0}
              >
                <MessageCircle size={18} />
                Place Order via WhatsApp
              </button>
              <p className={styles.submitNote}>
                This will open WhatsApp with your order pre-filled. Just hit Send!
              </p>
            </form>

            {/* Order Summary */}
            <aside className={styles.summary}>
              <h2 className={styles.summaryTitle}>
                <ShoppingBag size={18} /> Order Summary
              </h2>
              <ul className={styles.summaryList}>
                {items.map(item => (
                  <li key={item.id} className={styles.summaryItem}>
                    <div className={styles.summaryItemInfo}>
                      <span className={styles.summaryMenuTag}>{item.menuName}</span>
                      <p className={styles.summaryItemName}>{item.name}</p>
                    </div>
                    <div className={styles.summaryItemRight}>
                      <div className={styles.summaryQty}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className={styles.qtyBtn}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className={styles.qtyBtn}>+</button>
                      </div>
                      <span className={styles.summaryItemPrice}>৳{(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => removeItem(item.id)} className={styles.removeBtn} aria-label="Remove">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span className={styles.totalAmt}>৳{getTotal().toLocaleString()}</span>
              </div>
              <p className={styles.totalNote}>Delivery charges may apply</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
