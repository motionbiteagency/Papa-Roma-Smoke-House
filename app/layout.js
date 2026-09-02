import './globals.css';
import AppWrapper from './components/layout/AppWrapper';
import PublicShell from './components/layout/PublicShell';
import { CartProvider } from './context/CartContext';
import Providers from './components/Providers';
import { PublicDataProvider } from './context/PublicDataContext';
import { getPublicConfig, getMenuData, getTestimonials } from '@/lib/public-data';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paparoma.com.bd';

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: 'PAPA ROMA FOOD ENGINEERING | Premium BBQ & Restaurant in Dhanmondi, Dhaka',
  description: 'Experience the art of slow-smoked perfection at Dhanmondi\'s lakeside. Texas-style BBQ, authentic Bengali cuisine, international flavors, artisan beverages & handcrafted desserts.',
  keywords: 'Papa Roma, Smoke House, Dhanmondi, Dhaka, BBQ, restaurant, smoked meat, Bengali food, lakeside dining',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PAPA ROMA FOOD ENGINEERING',
    description: 'Where Smoke Meets Flavor — Premium BBQ & Restaurant in Dhanmondi, Dhaka',
    url: baseUrl,
    siteName: 'Papa Roma Smoke House',
    images: [
      {
        url: '/images/hero-bg.png', // Fallback to a hero image
        width: 1200,
        height: 630,
        alt: 'Papa Roma Smoke House Restaurant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PAPA ROMA FOOD ENGINEERING',
    description: 'Where Smoke Meets Flavor — Premium BBQ & Restaurant in Dhanmondi, Dhaka',
    images: ['/images/hero-bg.png'],
  },
};

export default async function RootLayout({ children }) {
  const [config, menuData, testimonials] = await Promise.all([
    getPublicConfig(),
    getMenuData(),
    getTestimonials(),
  ]);
  // update git authentication via SSH
  
  return (
    <html lang="en">
      <head>
      
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="google-site-verification" content="xuyNk6l0Tm88B6RSUoOVg7PiHiZJtOrUOqw7N9bsuSc" />

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

