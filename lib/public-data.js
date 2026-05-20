// lib/public-data.js
// Server-side cached Prisma queries for the public site.
// Falls back to static JSON files if the DB is unreachable (e.g. paused on free tier).

import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Static JSON fallbacks (always available)
import siteConfigFallback from '@/data/siteConfig.json';
import menusFallback from '@/data/menus.json';
import testimonialsFallback from '@/data/testimonials.json';

// ── Timeout helper ────────────────────────────────────────────────────────────
// Fails the promise after `ms` milliseconds so a sleeping/paused DB doesn't
// block the entire page render — it falls back to the JSON files instead.
function withTimeout(promise, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`DB query timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function serializeItem(item) {
  return {
    id: item.itemId || item.id,
    dbId: item.id,
    name: item.name,
    nameBn: item.nameBn || null,
    description: item.description || null,
    price: item.price,
    priceAlt: item.priceAlt || null,
    unit: item.unit || null,
    imageUrl: item.imageUrl || null,
    featured: item.featured,
    active: item.active,
  };
}

// ── Public Config ──────────────────────────────────────────────────────────────

export const getPublicConfig = unstable_cache(
  async () => {
    try {
      const rows = await withTimeout(prisma.siteConfig.findMany());
      const config = {};
      for (const row of rows) {
        try { config[row.key] = JSON.parse(row.value); } catch { config[row.key] = row.value; }
      }

      // Merge videos from the Video table into cookingVideos
      const dbVideos = await withTimeout(prisma.video.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      }));
      const videoSettings = config.cookingVideosSettings || {
        enabled: true,
        sectionLabel: 'Trending Now',
        sectionTitle: 'From Our Kitchen',
        sectionSubtitle: 'Watch our chefs bring fire, smoke & flavor to life — straight from the kitchen',
      };
      config.cookingVideos = {
        ...videoSettings,
        videos: dbVideos.map(v => ({
          id: v.id,
          title: v.title,
          youtubeId: v.youtubeId,
          category: v.category,
          duration: v.duration,
          views: v.views,
          featured: v.featured,
        })),
      };

      return config;
    } catch (err) {
      console.warn('[public-data] DB unavailable, using siteConfig.json fallback:', err.message);
      return siteConfigFallback;
    }
  },
  ['public-config'],
  { revalidate: 3600, tags: ['siteconfig', 'videos'] }
);

// ── Menu Data ──────────────────────────────────────────────────────────────────

export const getMenuData = unstable_cache(
  async () => {
    try {
      const menuTypes = await withTimeout(prisma.menuType.findMany({
        orderBy: { order: 'asc' },
        include: {
          categories: {
            orderBy: { order: 'asc' },
            include: {
              items: {
                where: { active: true },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      }));

      return {
        menuTypes: menuTypes.map(mt => ({
          id: mt.slug,
          dbId: mt.id,
          name: mt.name,
          slug: mt.slug,
          description: mt.description,
          icon: mt.icon,
          logoImage: mt.logoImage || null,
          categories: mt.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            nameBn: cat.nameBn || null,
            description: cat.description || null,
            items: cat.items.map(serializeItem),
          })),
        })),
      };
    } catch (err) {
      console.warn('[public-data] DB unavailable, using menus.json fallback:', err.message);
      return menusFallback;
    }
  },
  ['public-menus'],
  { revalidate: 3600, tags: ['menus'] }
);

// ── Testimonials ───────────────────────────────────────────────────────────────

export const getTestimonials = unstable_cache(
  async () => {
    try {
      const testimonials = await withTimeout(prisma.testimonial.findMany({
        where: { active: true },
        orderBy: { createdAt: 'asc' },
      }));
      return { testimonials };
    } catch (err) {
      console.warn('[public-data] DB unavailable, using testimonials.json fallback:', err.message);
      return testimonialsFallback;
    }
  },
  ['public-testimonials'],
  { revalidate: 3600, tags: ['testimonials'] }
);
