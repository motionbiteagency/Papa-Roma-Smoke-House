'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, UtensilsCrossed, Tag, Settings, Video,
  MessageSquare, Mail, Crown, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/admin',              label: 'Overview',      icon: <LayoutDashboard size={18} /> },
  { href: '/admin/menu',         label: 'Menu Manager',  icon: <UtensilsCrossed size={18} /> },
  { href: '/admin/offers',       label: 'Offers',        icon: <Tag size={18} /> },
  { href: '/admin/settings',     label: 'Site Settings', icon: <Settings size={18} /> },
  { href: '/admin/videos',       label: 'Videos',        icon: <Video size={18} /> },
  { href: '/admin/testimonials', label: 'Testimonials',  icon: <MessageSquare size={18} /> },
  { href: '/admin/inquiries',    label: 'Inquiries',     icon: <Mail size={18} /> },
  { href: '/admin/members',      label: 'Club Members',  icon: <Crown size={18} /> },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <Image src="/images/beef-club-logo.png" alt="Papa Roma" width={140} height={44} style={{ objectFit: 'contain' }} />
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
                {isActive && <ChevronRight size={14} className={styles.navChevron} />}
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
