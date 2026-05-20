import './globals.css';
import AppWrapper from './components/layout/AppWrapper';
import PublicShell from './components/layout/PublicShell';
import { CartProvider } from './context/CartContext';
import Providers from './components/Providers';
import { PublicDataProvider } from './context/PublicDataContext';
import { getPublicConfig, getMenuData, getTestimonials } from '@/lib/public-data';

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

export default async function RootLayout({ children }) {
  const [config, menuData, testimonials] = await Promise.all([
    getPublicConfig(),
    getMenuData(),
    getTestimonials(),
  ]);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <CartProvider>
            <PublicDataProvider config={config} menuData={menuData} testimonials={testimonials}>
              <AppWrapper>
                <PublicShell>{children}</PublicShell>
              </AppWrapper>
            </PublicDataProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}

