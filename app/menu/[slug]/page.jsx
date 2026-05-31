import { getMenuData } from '@/lib/public-data';
import MenuClient from './MenuClient';

// Pre-build all menu pages at build time using DB slugs
export async function generateStaticParams() {
  const { menuTypes } = await getMenuData();
  return menuTypes.map((menu) => ({ slug: menu.slug }));
}

// SEO metadata from DB
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { menuTypes } = await getMenuData();
  const menuType = menuTypes.find((m) => m.slug === slug);
  if (!menuType) return { title: 'Menu Not Found | Papa Roma Smoke House' };
  
  const title = `${menuType.name} Menu | Papa Roma Smoke House`;
  const description = menuType.description || `Explore our delicious ${menuType.name} menu.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/menu/${slug}`,
    },
    twitter: {
      title,
      description,
    }
  };
}

export default async function MenuPage({ params }) {
  const { slug } = await params;
  return <MenuClient slug={slug} />;
}
