'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Tag, Mail, Crown, MessageSquare, Video, Settings, ArrowRight, RefreshCw, Calendar } from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ menus: 0, items: 0, inquiries: 0, unreadInquiries: 0, testimonials: 0, members: 0, videos: 0, events: 0, pendingEvents: 0 });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [menus, inquiries, testimonials, members, config, events] = await Promise.all([
        fetch('/api/admin/menus').then(r => r.json()),
        fetch('/api/inquiries').then(r => r.json()),
        fetch('/api/admin/testimonials').then(r => r.json()),
        fetch('/api/admin/members').then(r => r.json()),
        fetch('/api/admin/siteconfig').then(r => r.json()),
        fetch('/api/admin/events').then(r => r.json()),
      ]);

      const totalItems = menus.menuTypes?.reduce((sum, mt) =>
        sum + mt.categories.reduce((s, c) => s + c.items.length, 0), 0) ?? 0;

      setStats({
        menus: menus.menuTypes?.length ?? 0,
        items: totalItems,
        inquiries: inquiries.inquiries?.length ?? 0,
        unreadInquiries: inquiries.inquiries?.filter(i => !i.read).length ?? 0,
        testimonials: testimonials.testimonials?.length ?? 0,
        members: members.members?.length ?? 0,
        videos: config.cookingVideos?.videos?.length ?? 0,
        events: events.bookings?.length ?? 0,
        pendingEvents: events.bookings?.filter(b => b.status === 'PENDING').length ?? 0,
      });

      setRecentInquiries((inquiries.inquiries ?? []).slice(-5).reverse());
      setRecentMembers((members.members ?? []).slice(-5).reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const STAT_CARDS = [
    { label: 'Menu Sections', value: stats.menus, icon: <UtensilsCrossed size={20} />, href: '/admin/menu', color: '#c62d39' },
    { label: 'Total Menu Items', value: stats.items, icon: <UtensilsCrossed size={20} />, href: '/admin/menu', color: '#b8913a' },
    { label: 'Inquiries', value: stats.inquiries, icon: <Mail size={20} />, href: '/admin/inquiries', color: '#3b82f6', badge: stats.unreadInquiries > 0 ? `${stats.unreadInquiries} new` : null },
    { label: 'Testimonials', value: stats.testimonials, icon: <MessageSquare size={20} />, href: '/admin/testimonials', color: '#a855f7' },
    { label: 'Club Members', value: stats.members, icon: <Crown size={20} />, href: '/admin/members', color: '#c62d39' },
    { label: 'Videos', value: stats.videos, icon: <Video size={20} />, href: '/admin/videos', color: '#f97316' },
    { label: 'Event Bookings', value: stats.events, icon: <Calendar size={20} />, href: '/admin/events', color: '#3b82f6', badge: stats.pendingEvents > 0 ? `${stats.pendingEvents} pending` : null },
  ];

  const QUICK_LINKS = [
    { href: '/admin/menu',         label: 'Edit Menu Items',       icon: <UtensilsCrossed size={16} /> },
    { href: '/admin/offers',       label: 'Manage Offers',         icon: <Tag size={16} /> },
    { href: '/admin/settings',     label: 'Site Settings',         icon: <Settings size={16} /> },
    { href: '/admin/inquiries',    label: 'View Inquiries',        icon: <Mail size={16} /> },
    { href: '/admin/members',      label: 'Club Members',          icon: <Crown size={16} /> },
    { href: '/admin/testimonials', label: 'Manage Testimonials',   icon: <MessageSquare size={16} /> },
    { href: '/admin/events',       label: 'Event Bookings',         icon: <Calendar size={16} /> },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="admin-page-title">Dashboard Overview</h1>
            <p className="admin-page-sub">Welcome back! Here's what's happening on your site.</p>
          </div>
          <button onClick={fetchStats} className="admin-btn admin-btn-ghost" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="admin-stat-grid">
        {STAT_CARDS.map((s, i) => (
          <Link key={i} href={s.href} style={{ textDecoration: 'none' }}>
            <div className="admin-stat-card" style={{ cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="admin-stat-label">{s.label}</span>
                <span style={{ color: s.color, opacity: 0.8 }}>{s.icon}</span>
              </div>
              <div className="admin-stat-value" style={{ color: s.color }}>{loading ? '—' : s.value}</div>
              {s.badge && (
                <span className="admin-badge admin-badge-red" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.65rem' }}>{s.badge}</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Quick Actions */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {QUICK_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', transition: 'all 0.2s' }}>
                <span style={{ color: '#c62d39' }}>{l.icon}</span>
                {l.label}
                <ArrowRight size={13} style={{ marginLeft: 'auto', opacity: 0.4 }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Recent Inquiries</h2>
            <Link href="/admin/inquiries" style={{ fontSize: '0.78rem', color: '#c62d39', textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Loading...</p>
            : recentInquiries.length === 0
            ? <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>No inquiries yet.</p>
            : recentInquiries.map(inq => (
              <div key={inq.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: inq.read ? 'rgba(255,255,255,0.5)' : '#fff' }}>{inq.name}</span>
                  {!inq.read && <span className="admin-badge admin-badge-red">New</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                  {inq.eventType || 'General'} · {new Date(inq.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Recent Club Members */}
      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Recent Club Members</h2>
          <Link href="/admin/members" style={{ fontSize: '0.78rem', color: '#c62d39', textDecoration: 'none' }}>View all →</Link>
        </div>
        {loading ? <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Loading...</p>
          : recentMembers.length === 0
          ? <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>No club members yet.</p>
          : (
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Preference</th><th>Status</th><th>Joined</th></tr></thead>
              <tbody>
                {recentMembers.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{m.name}</td>
                    <td>{m.phone}</td>
                    <td>{m.preference}</td>
                    <td><span className={`admin-badge ${m.status === 'ACTIVE' ? 'admin-badge-green' : m.status === 'REJECTED' || m.status === 'SUSPENDED' ? 'admin-badge-red' : 'admin-badge-gold'}`}>{m.status}</span></td>
                    <td style={{ fontSize: '0.78rem' }}>{new Date(m.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      <style>{`.spinning { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
