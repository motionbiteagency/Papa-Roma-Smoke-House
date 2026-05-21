/**
 * upload-local-images.mjs
 *
 * One-time script: finds every MenuItem whose imageUrl is a local path
 * (starts with "/images/"), reads the file from the /public folder,
 * uploads it to ImgBB, then updates the DB row with the ImgBB URL.
 *
 * Run:  node scripts/upload-local-images.mjs
 *
 * Requires IMGBB_API_KEY in .env or .env.local
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load env files (.env.local overrides .env)
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
config({ path: join(root, '.env') });
config({ path: join(root, '.env.local'), override: true });

const prisma = new PrismaClient();
const API_KEY = process.env.IMGBB_API_KEY;

if (!API_KEY) {
  console.error('❌  IMGBB_API_KEY not found in environment.');
  process.exit(1);
}

async function uploadToImgBB(base64, name) {
  const body = new URLSearchParams();
  body.append('image', base64);
  body.append('name', name);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(API_KEY)}`, {
    method: 'POST',
    body,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `ImgBB error (status ${res.status})`);
  }
  return json.data.url;
}

async function main() {
  // Find all items where imageUrl is a local path
  const items = await prisma.menuItem.findMany({
    where: { imageUrl: { startsWith: '/images/' } },
    select: { id: true, name: true, imageUrl: true },
  });

  if (items.length === 0) {
    console.log('✅  No items with local image paths found. Nothing to do.');
    return;
  }

  console.log(`Found ${items.length} item(s) with local image paths. Uploading to ImgBB...\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    const localPath = join(root, 'public', item.imageUrl);

    if (!existsSync(localPath)) {
      console.warn(`  ⚠  File not found on disk: ${localPath}  →  skipping "${item.name}"`);
      skipped++;
      continue;
    }

    try {
      const buffer = readFileSync(localPath);
      const base64 = buffer.toString('base64');
      // Derive a clean name from the filename
      const name = item.imageUrl.split('/').pop().replace(/\.[^.]+$/, '');

      process.stdout.write(`  ↑  Uploading "${item.name}" (${item.imageUrl}) ... `);
      const url = await uploadToImgBB(base64, name);
      await prisma.menuItem.update({ where: { id: item.id }, data: { imageUrl: url } });
      console.log(`✓  ${url}`);
      uploaded++;

      // Small delay to avoid hammering the ImgBB rate limit
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`✗  Failed for "${item.name}": ${err.message}`);
      failed++;
    }
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`  Uploaded : ${uploaded}`);
  console.log(`  Skipped  : ${skipped}  (file not found on disk)`);
  console.log(`  Failed   : ${failed}`);
  console.log(`──────────────────────────────────────`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
