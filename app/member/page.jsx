'use client';

import { useEffect, useState } from 'react';
import { Crown, Percent, Star, Flame, Truck, UtensilsCrossed, Gift, CheckCircle, Clock, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';

const BENEFITS = [
  { icon: <Percent size={18} />, title: '10% Off Every Order', desc: 'Exclusive 10% discount on every order, forever.' },
  { icon: <Star size={18} />, title: 'Special Member Offers', desc: 'Access to deals never available to the public.' },
  { icon: <Flame size={18} />, title: 'Exclusive Beef Parties', desc: 'Cook beef alongside our Master Chef.' },
  { icon: <Truck size={18} />, title: 'Premium Home Delivery', desc: 'Premium beef cuts delivered to your door.' },
  { icon: <UtensilsCrossed size={18} />, title: 'Early Menu Access', desc: 'First to taste new menu items.' },
  { icon: <Gift size={18} />, title: 'Milestone Gifts', desc: 'Exclusive gifts on spending milestones.' },
  { icon: <Crown size={18} />, title: 'Beef Tasting Events', desc: 'VIP invitations to exclusive beef tastings.' },
];

function StatusBadge({ status }) {
  const map = {
    ACTIVE: { label: 'Active Member', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', icon: <ShieldCheck size={13} /> },
    PENDING: { label: 'Pending Approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: <Clock size={13} /> },
    SUSPENDED: { label: 'Suspended', color: '#e05060', bg: 'rgba(198,45,57,0.1)', border: 'rgba(198,45,57,0.25)', icon: <Clock size={13} /> },
    REJECTED: { label: 'Not Approved', color: '#e05060', bg: 'rgba(198,45,57,0.1)', border: 'rgba(198,45,57,0.25)', icon: <Clock size={13} /> },
  };
  const s = map[status] || map.PENDING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: '4px 12px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700 }}>
      {s.icon} {s.label}
    </span>
  );
}

export default function MemberDashboard() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/member/profile')
      .then(r => r.json())
      .then(d => { setMember(d.member); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '3rem', textAlign: 'center' }}>Loading your profile...</div>;

  const isActive = member?.status === 'ACTIVE';

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1008, #110808)', border: '1px solid rgba(184,142,53,0.15)', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Crown size={20} style={{ color: '#b8913a' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b8913a', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Beef Eater Club</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              Welcome back, {member?.name?.split(' ')[0]}! 🥩
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <StatusBadge status={member?.status} />
              {member?.membershipId && (
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                  ID: BEC-{member.membershipId.slice(-8).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <Link href="/member/profile" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'rgba(184,142,53,0.1)', border: '1px solid rgba(184,142,53,0.25)', borderRadius: 9, color: '#b8913a', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            <User size={15} /> Edit Profile
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Member Since', value: member?.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-BD', { month: 'short', year: 'numeric' }) : '—' },
            { label: 'Loyalty Points', value: member?.points ?? 0 },
            { label: 'Benefits', value: 7 },
            { label: 'Your Preference', value: member?.preference ?? '—' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 18px', minWidth: 110 }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending notice */}
      {!isActive && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Clock size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 3 }}>Membership Pending Review</div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>
              Your application is being reviewed by our team. Once approved, you'll get full access to all benefits. We'll contact you at <strong>{member?.phone}</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Benefits Grid */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Your Membership Benefits</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{
              background: '#181818', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem',
              opacity: isActive ? 1 : 0.45, position: 'relative', overflow: 'hidden',
            }}>
              {isActive && <div style={{ position: 'absolute', top: 10, right: 10 }}><CheckCircle size={14} style={{ color: '#22c55e' }} /></div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#b8913a' }}>{b.icon}</span>
                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>{b.title}</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Quick links:</span>
        <a href="/" style={{ fontSize: '0.85rem', color: '#b8913a', textDecoration: 'none', fontWeight: 600 }}>🏠 Restaurant Home</a>
        <a href="/menu/smoke-house" style={{ fontSize: '0.85rem', color: '#b8913a', textDecoration: 'none', fontWeight: 600 }}>🍖 View Menu</a>
        <a href="/events" style={{ fontSize: '0.85rem', color: '#b8913a', textDecoration: 'none', fontWeight: 600 }}>🎉 Book an Event</a>
      </div>
    </div>
  );
}
