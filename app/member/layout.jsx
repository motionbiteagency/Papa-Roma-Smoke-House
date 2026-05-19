'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Crown, User, LogOut, Home, Shield } from 'lucide-react';
import styles from './layout.module.css';

export default function MemberLayout({ children }) {
  const pathname = usePathname();
  if (pathname === '/member/login') return <>{children}</>;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLogo}>
            <div className={styles.logoBg}>
              <Image src="/images/beef-club-logo.png" alt="Beef Eater Club" width={130} height={40} style={{ objectFit: 'contain' }} />
            </div>
          </div>
          <nav className={styles.headerNav}>
            <Link href="/member" className={`${styles.navLink} ${pathname === '/member' ? styles.navLinkActive : ''}`}>
              <Crown size={15} /> Dashboard
            </Link>
            <Link href="/member/profile" className={`${styles.navLink} ${pathname === '/member/profile' ? styles.navLinkActive : ''}`}>
              <User size={15} /> My Profile
            </Link>
            <Link href="/" className={styles.navLink}>
              <Home size={15} /> Restaurant
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={15} /> Logout
            </button>
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
