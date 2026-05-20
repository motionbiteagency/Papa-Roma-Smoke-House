'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Flame, ShoppingBag, CalendarDays } from 'lucide-react';
import { usePublicData } from '@/app/context/PublicDataContext';
import { getItemImage } from '@/data/itemImages';
import { useCart } from '@/app/context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { config, menuData } = usePublicData();
  const { getCount, toggleDrawer } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.nav}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoImageWrapper}>
            <Image 
              src="/images/logo.png" 
              alt="Papa Roma Logo" 
              width={48} 
              height={48} 
              style={{ objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
              priority
            />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>PAPA ROMA</span>
            <span className={styles.logoSub}>FOOD ENGINEERING</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className={styles.navLinks}>
          {(config.navLinks || []).map((link) => {
            // Check if this link corresponds to a menu category
            const isMenuLink = link.href.startsWith('/menu/');
            const menuSlug = isMenuLink ? link.href.replace('/menu/', '') : null;
            const menuCategory = menuSlug ? (menuData.menuTypes || []).find(m => m.slug === menuSlug) : null;
            
            // Get up to 4 items from the first category of this menu to feature
            const featuredItems = menuCategory 
              ? menuCategory.categories[0]?.items.slice(0, 4) || []
              : [];

            return (
              <li key={link.href} className={styles.navItem}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
                
                {/* Mega Menu Dropdown */}
                {isMenuLink && menuCategory && featuredItems.length > 0 && (
                  <div className={styles.megaMenu}>
                    <div className={styles.megaGrid}>
                      {featuredItems.map((item, index) => (
                        <Link 
                          href={`${link.href}#${item.id}`} 
                          key={item.id} 
                          className={styles.megaItem}
                          style={{ animationDelay: `${index * 0.15}s` }}
                        >
                          <div className={styles.megaImageWrapper}>
                            <Image 
                              src={getItemImage(item.id)} 
                              alt={item.name} 
                              fill 
                              sizes="(max-width: 768px) 100vw, 250px"
                              style={{ objectFit: 'cover' }}
                              className={styles.megaItemImage}
                            />
                          </div>
                          <h4 className={styles.megaItemName}>{item.name}</h4>
                          <span className={styles.megaItemPrice}>
                            ৳{item.price} {item.unit ? `(${item.unit})` : ''}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className={styles.navActions}>
          <Link href="/events" className={styles.eventBtn}>
            <CalendarDays size={15} />
            Book An Event
          </Link>

          <a
            href={`https://wa.me/${config.restaurant?.whatsapp}?text=Hi! I'd like to make a reservation at PAPA ROMA FOOD ENGINEERING 🔥`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            Reserve A Table
          </a>

          <button
            className={styles.navCartBtn}
            onClick={toggleDrawer}
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {getCount() > 0 && <span className={styles.navCartBadge}>{getCount()}</span>}
          </button>

          <button
            className={styles.mobileToggle}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenu} ${isOpen ? styles.mobileOpen : ''}`}>
        <ul className={styles.mobileLinks}>
          {(config.navLinks || []).map((link, i) => (
            <li key={link.href} style={{ transitionDelay: `${i * 0.06}s` }}>
              <Link
                href={link.href}
                className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div 
          className={styles.mobileActions} 
          style={{ transitionDelay: `${(config.navLinks || []).length * 0.06}s` }}
        >
          <button 
            className={styles.mobileCartBtn} 
            onClick={() => {
              setIsOpen(false);
              toggleDrawer();
            }}
          >
            <ShoppingBag size={20} />
            <span>View Order {getCount() > 0 ? `(${getCount()})` : ''}</span>
          </button>
          
          <Link href="/events" className={`btn btn-secondary ${styles.mobileCta}`} onClick={() => setIsOpen(false)}>
            <CalendarDays size={16} /> Book An Event
          </Link>

          <a
            href={`https://wa.me/${config.restaurant?.whatsapp}?text=Hi! I'd like to make a reservation at PAPA ROMA FOOD ENGINEERING 🔥`}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-primary ${styles.mobileCta}`}
          >
            Reserve A Table
          </a>
        </div>
      </div>
    </header>
  );
}
