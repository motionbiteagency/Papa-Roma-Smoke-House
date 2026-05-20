import './globals.css';
import AppWrapper from './components/layout/AppWrapper';
import PublicShell from './components/layout/PublicShell';
import { CartProvider } from './context/CartContext';
import Providers from './components/Providers';

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
        <Providers>
          <CartProvider>
            <AppWrapper>
              <PublicShell>{children}</PublicShell>
            </AppWrapper>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}

