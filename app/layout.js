import './globals.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppFAB from './components/layout/WhatsAppFAB';
import AppWrapper from './components/layout/AppWrapper';
import { CartProvider } from './context/CartContext';
import CartButton from './components/cart/CartButton';
import CartDrawer from './components/cart/CartDrawer';

export const metadata = {
  title: 'PAPA ROMA FOOD ENGINEERING | Premium BBQ & Restaurant in Dhanmondi, Dhaka',
  description: 'Experience the art of slow-smoked perfection at Dhanmondi\'s lakeside. Texas-style BBQ, authentic Bengali cuisine, international flavors, artisan beverages & handcrafted desserts.',
  keywords: 'Papa Roma, Smoke House, Dhanmondi, Dhaka, BBQ, restaurant, smoked meat, Bengali food, lakeside dining',
  openGraph: {
    title: 'PAPA ROMA FOOD ENGINEERING',
    description: 'Where Smoke Meets Flavor — Premium BBQ & Restaurant in Dhanmondi, Dhaka',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <CartProvider>
          <AppWrapper>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppFAB />
            <CartButton />
            <CartDrawer />
          </AppWrapper>
        </CartProvider>
      </body>
    </html>
  );
}

