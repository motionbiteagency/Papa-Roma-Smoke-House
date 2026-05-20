import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const [mt, cat, item, test, vid, cfg] = await Promise.all([
  p.menuType.count(),
  p.category.count(),
  p.menuItem.count(),
  p.testimonial.count(),
  p.video.count(),
  p.siteConfig.count(),
]);
console.log({ menuTypes: mt, categories: cat, menuItems: item, testimonials: test, videos: vid, siteConfigs: cfg });
await p.$disconnect();
