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
  return {
    title: `${menuType.name} Menu | Papa Roma Smoke House`,
    description: menuType.description,
  };
}

export default async function MenuPage({ params }) {
  const { slug } = await params;
  return <MenuClient slug={slug} />;
}
