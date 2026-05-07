import menuData from '@/data/menus.json';
import MenuClient from './MenuClient';

// This function tells Next.js to pre-build all menu pages at build time
export function generateStaticParams() {
  return menuData.menuTypes.map((menu) => ({
    slug: menu.slug,
  }));
}

// Optional: Generate SEO metadata dynamically for each menu
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const menuType = menuData.menuTypes.find((m) => m.slug === slug);
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
