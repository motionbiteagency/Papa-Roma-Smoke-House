'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShoppingBag, Trash2, Loader2, CreditCard, Truck, CheckCircle2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { usePublicData } from '@/app/context/PublicDataContext';
import styles from './checkout.module.css';

function buildWhatsAppMessage(form, items, total, paymentMethods, whatsapp) {
  const itemLines = items
    .map(i => `  • ${i.name}${i.unit ? ` (${i.unit})` : ''} x${i.quantity} — ৳${(i.price * i.quantity).toLocaleString()}`)
    .join('\n');

  const paymentLine =
    form.paymentMethod === 'cod'
      ? '💵 *Payment:* Cash on Delivery'
      : `💳 *Payment:* ${paymentMethods[form.selectedGateway]?.name || 'Online'}\n🧾 *Transaction ID:* ${form.transactionId}`;

  const lines = [
    `🍽️ *NEW ORDER — PAPA ROMA FOOD ENGINEERING*`,
    ``,
    `👤 *Name:* ${form.name}`,
    `📞 *Phone:* ${form.phone}`,
    `🚚 *Type:* ${form.orderType === 'delivery' ? 'Delivery' : 'Pickup'}`,
    form.orderType === 'delivery' ? `📍 *Address:* ${form.address}` : null,
    ``,
    paymentLine,
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

  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines)}`;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" className={styles.copyBtn} onClick={handleCopy} title="Copy">
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export default function CheckoutPage() {
  const { config } = usePublicData();
  const paymentMethods = config.paymentMethods || {};
  const whatsapp = config.restaurant?.whatsapp || '';
  const { items, getTotal, updateQty, removeItem, clearCart } = useCart();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    orderType: 'delivery',
    address: '',
    notes: '',
    paymentMethod: 'online',     // 'cod' | 'online' Default to online
    selectedGateway: 'bkash', // 'bkash' | 'nagad' | 'bank'
    transactionId: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid =
    form.name.trim() &&
    form.phone.trim() &&
    (form.orderType === 'pickup' || form.address.trim()) &&
    (form.paymentMethod === 'cod' || form.transactionId.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || items.length === 0) return;

    setLoading(true);
    const url = buildWhatsAppMessage(form, items, getTotal(), paymentMethods, whatsapp);

    setTimeout(() => {
      window.open(url, '_blank');
      setSubmitted(true);
      clearCart();
      setLoading(false);
    }, 600);
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

  const gateway = paymentMethods[form.selectedGateway] || {};
  const totalAmount = getTotal();

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
            {/* ── Form ── */}
            <form className={styles.form} onSubmit={handleSubmit} id="checkout-form">
              <h2 className={styles.formTitle}>Your Details</h2>

              {/* Name */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">Full Name *</label>
                <input
                  id="name" name="name" type="text"
                  className={styles.input}
                  placeholder="e.g. Rahim Uddin"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="phone">Phone Number *</label>
                <input
                  id="phone" name="phone" type="tel"
                  className={styles.input}
                  placeholder="e.g. 01711-123456"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <p className={styles.fieldHint}>Must be a valid Bangladeshi number.</p>
              </div>

              {/* Order Type */}
              <div className={styles.field}>
                <label className={styles.label}>Order Type *</label>
                <div className={styles.radioGroup}>
                  <label className={`${styles.radioCard} ${form.orderType === 'delivery' ? styles.radioCardActive : ''}`}>
                    <input type="radio" name="orderType" value="delivery"
                      checked={form.orderType === 'delivery'} onChange={handleChange} hidden />
                    <span>🚚 Delivery</span>
                  </label>
                  <label className={`${styles.radioCard} ${form.orderType === 'pickup' ? styles.radioCardActive : ''}`}>
                    <input type="radio" name="orderType" value="pickup"
                      checked={form.orderType === 'pickup'} onChange={handleChange} hidden />
                    <span>🏃 Pickup</span>
                  </label>
                </div>
              </div>

              {form.orderType === 'delivery' && (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="address">Delivery Address *</label>
                  <textarea
                    id="address" name="address"
                    className={styles.textarea}
                    placeholder="House no, Road, Area, Dhaka"
                    rows={3}
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {/* ── Payment Method ──────────────────────────────────── */}
              <div className={styles.paymentSection}>
                <h3 className={styles.paymentSectionTitle}>
                  <CreditCard size={17} /> Payment Method
                </h3>

                {/* Online / COD Toggle */}
                <div className={styles.radioGroup}>
                  <label className={`${styles.radioCard} ${form.paymentMethod === 'online' ? styles.radioCardActive : ''}`}>
                    <input type="radio" name="paymentMethod" value="online"
                      checked={form.paymentMethod === 'online'} onChange={handleChange} hidden />
                    <span>💳 Make Payment</span>
                  </label>
                  <label className={`${styles.radioCard} ${form.paymentMethod === 'cod' ? styles.radioCardActive : ''}`}>
                    <input type="radio" name="paymentMethod" value="cod"
                      checked={form.paymentMethod === 'cod'} onChange={handleChange} hidden />
                    <span>🚛 Pay on Delivery</span>
                  </label>
                </div>

                {/* Online payment panel */}
                {form.paymentMethod === 'online' && (
                  <div className={styles.paymentOptions}>

                    {/* Gateway pills */}
                    <div className={styles.gatewayGroup}>
                      {Object.entries(paymentMethods).map(([key, method]) => (
                        <label
                          key={key}
                          className={`${styles.gatewayCard} ${form.selectedGateway === key ? styles.gatewayCardActive : ''}`}
                          style={form.selectedGateway === key ? { '--gw-color': method.color } : {}}
                        >
                          <input type="radio" name="selectedGateway" value={key}
                            checked={form.selectedGateway === key} onChange={handleChange} hidden />
                          {method.logoUrl ? (
                            <img src={method.logoUrl} alt={method.name} className={styles.gatewayLogo} />
                          ) : (
                            <span className={styles.gatewayEmoji}>{method.emoji}</span>
                          )}
                          <span className={styles.gatewayName}>{method.name}</span>
                        </label>
                      ))}
                    </div>

                    {/* Details card */}
                    <div className={styles.paymentDetailsCard} style={{ '--gw-color': gateway.color }}>
                      <div className={styles.paymentDetailsHeader}>
                        {gateway.logoUrl ? (
                          <div className={styles.paymentDetailsLogoWrapper}>
                            <img src={gateway.logoUrl} alt={gateway.name} className={styles.paymentDetailsLogo} />
                          </div>
                        ) : (
                          <span className={styles.paymentDetailsEmoji}>{gateway.emoji}</span>
                        )}
                        <div>
                          <p className={styles.paymentDetailsTitle}>{gateway.name}</p>
                          <p className={styles.paymentDetailsType}>{gateway.type}</p>
                        </div>
                        <div className={styles.paymentAmountBadge}>
                          ৳{totalAmount.toLocaleString()}
                        </div>
                      </div>

                      <div className={styles.paymentDetailsList}>
                        {gateway.bankName && (
                          <div className={styles.paymentDetailRow}>
                            <span className={styles.paymentDetailKey}>Bank</span>
                            <span className={styles.paymentDetailVal}>{gateway.bankName}</span>
                          </div>
                        )}
                        {gateway.accountName && (
                          <div className={styles.paymentDetailRow}>
                            <span className={styles.paymentDetailKey}>Account Name</span>
                            <span className={styles.paymentDetailVal}>{gateway.accountName}</span>
                          </div>
                        )}
                        {gateway.number && (
                          <div className={styles.paymentDetailRow}>
                            <span className={styles.paymentDetailKey}>Number</span>
                            <span className={styles.paymentDetailValHighlight}>
                              {gateway.number}
                              <CopyButton text={gateway.number} />
                            </span>
                          </div>
                        )}
                        {gateway.accountNumber && (
                          <div className={styles.paymentDetailRow}>
                            <span className={styles.paymentDetailKey}>Account No.</span>
                            <span className={styles.paymentDetailValHighlight}>
                              {gateway.accountNumber}
                              <CopyButton text={gateway.accountNumber} />
                            </span>
                          </div>
                        )}
                        {gateway.branchName && (
                          <div className={styles.paymentDetailRow}>
                            <span className={styles.paymentDetailKey}>Branch</span>
                            <span className={styles.paymentDetailVal}>{gateway.branchName}</span>
                          </div>
                        )}
                        {gateway.routingNumber && (
                          <div className={styles.paymentDetailRow}>
                            <span className={styles.paymentDetailKey}>Routing No.</span>
                            <span className={styles.paymentDetailVal}>{gateway.routingNumber}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.paymentInstructionContainer}>
                        <button 
                          type="button" 
                          className={styles.instructionToggle} 
                          onClick={() => setInstructionsExpanded(!instructionsExpanded)}
                        >
                          <CheckCircle2 size={15} className={styles.instructionIcon} />
                          <span>How to Pay</span>
                          {instructionsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        {instructionsExpanded && (
                          <div className={styles.instructionContent}>
                            <ol className={styles.instructionList}>
                              {gateway.instructions.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transaction ID */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="transactionId">
                        Transaction ID *
                      </label>
                      <input
                        id="transactionId" name="transactionId" type="text"
                        className={styles.input}
                        placeholder="e.g. 8N7A3B2K1X or TXN123456789"
                        value={form.transactionId}
                        onChange={handleChange}
                        maxLength={20}
                        required
                      />
                      <p className={styles.txnHelp}>
                        Enter the Transaction ID you received after completing the payment.
                      </p>
                    </div>
                  </div>
                )}

                {/* COD note */}
                {form.paymentMethod === 'cod' && (
                  <div className={styles.codNote}>
                    <Truck size={16} />
                    <span>You will pay in cash when your order is delivered or at pickup. Our team will confirm your order shortly.</span>
                  </div>
                )}
              </div>
              {/* ──────────────────────────────────────────────────────── */}

              {/* Notes */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="notes">Special Instructions</label>
                <textarea
                  id="notes" name="notes"
                  className={styles.textarea}
                  placeholder="Allergies, extra sauce, spice level..."
                  rows={2}
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              {/* Desktop Submit Button (Hidden on Mobile) */}
              <div className={styles.desktopSubmitWrapper}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={!isValid || items.length === 0 || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      Opening WhatsApp...
                    </>
                  ) : (
                    <>
                      <MessageCircle size={18} />
                      Place Order — ৳{totalAmount.toLocaleString()}
                    </>
                  )}
                </button>
                <p className={styles.submitNote}>
                  This will open WhatsApp with your order pre-filled. Just hit Send!
                </p>
              </div>
            </form>

            {/* ── Order Summary Sidebar ── */}
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
                <span className={styles.totalAmt}>৳{totalAmount.toLocaleString()}</span>
              </div>
              <p className={styles.totalNote}>Delivery charges may apply</p>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile Sticky Submit Bar */}
      {items.length > 0 && (
        <div className={styles.mobileSubmitBar}>
          <div className={styles.mobileSubmitInfo}>
            <span className={styles.mobileSubmitLabel}>Total</span>
            <span className={styles.mobileSubmitTotal}>৳{totalAmount.toLocaleString()}</span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            className={styles.mobileSubmitBtn}
            disabled={!isValid || loading}
          >
            {loading ? <Loader2 size={18} className={styles.spinner} /> : 'Place Order'}
          </button>
        </div>
      )}
    </div>
  );
}
