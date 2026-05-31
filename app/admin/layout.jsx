'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, UtensilsCrossed, Tag, Settings, Video,
  MessageSquare, Mail, Crown, LogOut, Menu, X, ChevronRight, Calendar, ClipboardList
} from 'lucide-react';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/admin',              label: 'Overview',         icon: <LayoutDashboard size={18} /> },
  { href: '/admin/orders',       label: 'Order Management', icon: <ClipboardList size={18} />, badgeKey: 'orders' },
  { href: '/admin/menu',         label: 'Menu Manager',     icon: <UtensilsCrossed size={18} /> },
  { href: '/admin/offers',       label: 'Offers',           icon: <Tag size={18} /> },
  { href: '/admin/videos',       label: 'Videos',        icon: <Video size={18} /> },
  { href: '/admin/testimonials', label: 'Testimonials',  icon: <MessageSquare size={18} /> },
  { href: '/admin/inquiries',    label: 'Inquiries',     icon: <Mail size={18} />, badgeKey: 'inquiries' },
  { href: '/admin/events',       label: 'Events',        icon: <Calendar size={18} />, badgeKey: 'events' },
  { href: '/admin/members',      label: 'Club Members',  icon: <Crown size={18} /> },
  { href: '/admin/settings',     label: 'Site Settings', icon: <Settings size={18} /> },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({ inquiries: 0, events: 0, orders: 0 });

  useEffect(() => {
    // Fetch unread/pending counts for sidebar badges
    Promise.all([
      fetch('/api/inquiries').then(r => r.json()).catch(() => ({ inquiries: [] })),
      fetch('/api/admin/events').then(r => r.json()).catch(() => ({ bookings: [] })),
      fetch('/api/admin/orders?status=PENDING').then(r => r.json()).catch(() => ({ orders: [] })),
    ]).then(([inqData, evtData, ordData]) => {
      setBadges({
        inquiries: (inqData.inquiries || []).filter(i => !i.read).length,
        events:    (evtData.bookings  || []).filter(b => b.status === 'PENDING').length,
        orders:    (ordData.orders    || []).length,
      });
    });
  }, [pathname]); // refresh counts whenever user navigates

  // Don't render the shell on the login page
  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <div className={styles.sidebarLogoCircle}>
              <Image src="/images/logo.png" alt="Papa Roma" width={36} height={36} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>PAPA ROMA</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px' }}>FOOD ENGINEERING</div>
            </div>
          </div>
          <div className={styles.adminBadge}>Admin Panel</div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.badgeKey && badges[item.badgeKey] > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#c62d39', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '100px', padding: '2px 7px', minWidth: 20, textAlign: 'center' }}>
                    {badges[item.badgeKey]}
                  </span>
                )}
                {isActive && !badges[item.badgeKey] && <ChevronRight size={14} className={styles.navChevron} />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" target="_blank" className={styles.viewSiteBtn}>
            View Live Site ↗
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(v => !v)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className={styles.topbarTitle}>
            {NAV_ITEMS.find(n => n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href))?.label || 'Admin'}
          </div>
          <button onClick={handleLogout} className={styles.topbarLogout}>
            <LogOut size={16} /> Logout
          </button>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
