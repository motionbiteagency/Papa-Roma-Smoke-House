// Seed script — migrates all existing JSON data into PostgreSQL
// Run with: node prisma/seed.js   (after DATABASE_URL is set)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');
const prisma = new PrismaClient();

function readJSON(file) {
  return JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
}

async function main() {
  console.log('🌱 Starting seed...');

  // ── Admin ──────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@paparoma.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'paparoma2024';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash },
    create: { email: adminEmail, passwordHash: adminHash, name: 'Admin' },
  });
  console.log('✓ Admin created:', adminEmail);

  // ── Site Config ────────────────────────────────────────────
  const config = readJSON('siteConfig.json');
  const configKeys = ['restaurant', 'heroSlides', 'hotPicksItemIds', 'offerItemIds',
    'popupOffer', 'navLinks', 'currentOffer', 'imageBanner', 'paymentMethods'];

  for (const key of configKeys) {
    if (config[key] !== undefined) {
      await prisma.siteConfig.upsert({
        where: { key },
        update: { value: JSON.stringify(config[key]) },
        create: { key, value: JSON.stringify(config[key]) },
      });
    }
  }
  // Store video section settings (not individual videos)
  if (config.cookingVideos) {
    const { videos, ...videoSettings } = config.cookingVideos;
    await prisma.siteConfig.upsert({
      where: { key: 'cookingVideosSettings' },
      update: { value: JSON.stringify(videoSettings) },
      create: { key: 'cookingVideosSettings', value: JSON.stringify(videoSettings) },
    });
  }
  console.log('✓ SiteConfig migrated');

  // ── Videos ────────────────────────────────────────────────
  if (config.cookingVideos?.videos) {
    const seen = new Set();
    let order = 0;
    for (const v of config.cookingVideos.videos) {
      if (seen.has(v.youtubeId)) continue;
      seen.add(v.youtubeId);
      await prisma.video.create({
        data: {
          title: v.title,
          youtubeId: v.youtubeId,
          category: v.category || 'General',
          duration: v.duration || '',
          views: v.views || '',
          featured: v.featured || false,
          order: order++,
        },
      });
    }
    console.log(`✓ ${seen.size} videos migrated`);
  }

  // ── Menus ──────────────────────────────────────────────────
  const menuData = readJSON('menus.json');
  for (let mIdx = 0; mIdx < menuData.menuTypes.length; mIdx++) {
    const mt = menuData.menuTypes[mIdx];
    const menuType = await prisma.menuType.create({
      data: {
        name: mt.name,
        slug: mt.slug,
        description: mt.description,
        icon: mt.icon,
        logoImage: mt.logoImage || null,
        order: mIdx,
      },
    });

    for (let cIdx = 0; cIdx < mt.categories.length; cIdx++) {
      const cat = mt.categories[cIdx];
      const category = await prisma.category.create({
        data: {
          menuTypeId: menuType.id,
          name: cat.name,
          nameBn: cat.nameBn || null,
          description: cat.description || null,
          order: cIdx,
        },
      });

      for (let iIdx = 0; iIdx < cat.items.length; iIdx++) {
        const item = cat.items[iIdx];
        await prisma.menuItem.create({
          data: {
            categoryId: category.id,
            itemId: item.id,
            name: item.name,
            nameBn: item.nameBn || null,
            description: item.description || null,
            price: item.price,
            priceAlt: item.priceAlt || null,
            unit: item.unit || null,
            featured: item.featured || false,
            order: iIdx,
          },
        });
      }
    }
  }
  console.log('✓ Menus migrated');

  // ── Offers ────────────────────────────────────────────────
  const offersData = readJSON('offers.json');
  for (const o of offersData.offers) {
    await prisma.offer.create({
      data: {
        title: o.title,
        description: o.description || null,
        code: o.code || null,
        discount: o.discount || 0,
        startDate: o.startDate ? new Date(o.startDate) : null,
        endDate: o.endDate ? new Date(o.endDate) : null,
        active: o.active ?? true,
      },
    });
  }
  console.log('✓ Offers migrated');

  // ── Testimonials ──────────────────────────────────────────
  const testData = readJSON('testimonials.json');
  for (const t of testData.testimonials) {
    await prisma.testimonial.create({
      data: {
        name: t.name,
        image: t.image || null,
        rating: t.rating,
        comment: t.comment,
        active: t.active ?? true,
      },
    });
  }
  console.log('✓ Testimonials migrated');

  console.log('\n✅ Seed complete!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
