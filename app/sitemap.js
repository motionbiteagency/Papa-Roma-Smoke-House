import { getMenuData } from '@/lib/public-data';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paparoma.com.bd';

  // Define the core static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/events',
    '/gallery',
    '/beef-club',
    '/submit-review',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch all menu categories to generate dynamic routes
  let menuRoutes = [];
  try {
    const { menuTypes } = await getMenuData();
    menuRoutes = (menuTypes || []).map((menu) => ({
      url: `${baseUrl}/menu/${menu.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Failed to generate sitemap for menus:', error);
  }

  return [...staticRoutes, ...menuRoutes];
}
