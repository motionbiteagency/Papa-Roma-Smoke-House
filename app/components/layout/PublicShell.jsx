'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppFAB from './WhatsAppFAB';
import OfferPopup from './OfferPopup';
import CartButton from '../cart/CartButton';
import CartDrawer from '../cart/CartDrawer';

// Routes that should NOT show the public site chrome (navbar, footer, etc.)
const DASHBOARD_PREFIXES = ['/admin', '/member'];

export default function PublicShell({ children }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p));

  if (isDashboard) {
    // Admin / member dashboards manage their own layout
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppFAB />
      <OfferPopup />
      <CartButton />
      <CartDrawer />
    </>
  );
}
