/**
 * One-time migration: copies image URLs from data/itemImages.js
 * into the MenuItem.imageUrl column in the DB.
 *
 * Run: node scripts/migrate-images.mjs
 */

import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const prisma = new PrismaClient();

// Inline the map here so we don't need ESM import tricks
const itemImageMap = {
  sm1: '/images/item_brisket.png',
  sm2: '/images/item_beef_ribs.png',
  sm3: '/images/item_beef_shank.png',
  sm4: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=500&q=80',
  sm5: '/images/item_smoked_lamb.png',
  sm6: '/images/item_smoked_chicken.png',
  sm7: '/images/item_sausage.png',
  sd1: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
  bs1: '/images/item_brisket_burger.png',
  bs2: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=500&q=80',
  bs3: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
  bs4: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&q=80',
  bs5: 'https://images.unsplash.com/photo-1611590027211-b954fd27b4f6?w=500&q=80',
  bs6: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&q=80',
  bs7: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80',
  pl1: '/images/item_platter.png',
  bk1: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
  bk2: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
  bk3: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
  bk4: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500&q=80',
  bk5: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80',
  bk6: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&q=80',
  bk7: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80',
  bl1: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=500&q=80',
  bl2: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80',
  bl3: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500&q=80',
  bl4: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500&q=80',
  bl5: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500&q=80',
  bl6: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=500&q=80',
  bl7: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500&q=80',
  bl8: '/images/item_koral_paturi.png',
  bl9: '/images/item_koral_paturi.png',
  bl10: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
  bl11: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
  bl12: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
  bl13: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80',
  bl14: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500&q=80',
  bl15: 'https://images.unsplash.com/photo-1551529834-525807d6b4f3?w=500&q=80',
  bl16: 'https://images.unsplash.com/photo-1488477181212-4fc5b60ee682?w=500&q=80',
  bm1: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80',
  bm2: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
  bm3: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
  bm4: '/images/item_nehari.png',
  bm5: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500&q=80',
  bm6: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500&q=80',
  bm7: 'https://images.unsplash.com/photo-1551529834-525807d6b4f3?w=500&q=80',
  bm8: 'https://images.unsplash.com/photo-1488477181212-4fc5b60ee682?w=500&q=80',
  bm9: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80',
  ps1: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80',
  ps2: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
  ps3: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80',
  ps4: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80',
  ps5: '/images/food-burger.png',
  ps6: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80',
  ps7: '/images/item_platter.png',
  ps8: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
  pm1: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80',
  pm2: '/images/item_fettuccine_alfredo.png',
  pm3: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&q=80',
  pm4: '/images/item_lasagna.png',
  pm5: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500&q=80',
  pm6: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&q=80',
  pm7: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=500&q=80',
  pm8: '/images/item_brisket.png',
  pm9: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=500&q=80',
  pm10: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
  fj1: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80',
  fj2: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=500&q=80',
  fj3: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&q=80',
  fj4: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&q=80',
  fj5: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500&q=80',
  fj6: 'https://images.unsplash.com/photo-1622597467836-f3e0f9c5b8e1?w=500&q=80',
  fj7: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&q=80',
  fj8: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80',
  mk1: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80',
  mk2: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=500&q=80',
  mk3: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80',
  mk4: '/images/item_mojito.png',
  mk5: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80',
  mk6: 'https://images.unsplash.com/photo-1560508179-b2c9a3f8e92b?w=500&q=80',
  mk7: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80',
  mk8: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&q=80',
  mk9: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80',
  mk10: 'https://images.unsplash.com/photo-1560508179-b2c9a3f8e92b?w=500&q=80',
  mk11: '/images/item_mojito.png',
  mk12: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500&q=80',
  mk13: 'https://images.unsplash.com/photo-1588776814546-1ffedac7aded?w=500&q=80',
  fr1: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80',
  fr2: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80',
  fr3: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80',
  fr4: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80',
  fr5: '/images/item_matcha_tiramisu.png',
  mt1: '/images/item_matcha_tiramisu.png',
  mt2: '/images/item_matcha_tiramisu.png',
  mt3: '/images/item_matcha_tiramisu.png',
  mt4: '/images/item_matcha_tiramisu.png',
  mt5: '/images/item_matcha_tiramisu.png',
  ms1: 'https://images.unsplash.com/photo-1572490122747-3538f3d0eb87?w=500&q=80',
  ms2: 'https://images.unsplash.com/photo-1572490122747-3538f3d0eb87?w=500&q=80',
  ms3: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80',
  ms4: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&q=80',
  ms5: 'https://images.unsplash.com/photo-1572490122747-3538f3d0eb87?w=500&q=80',
  ls1: 'https://images.unsplash.com/photo-1488477181212-4fc5b60ee682?w=500&q=80',
  te1: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80',
  te2: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80',
  te3: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80',
  te4: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80',
  te5: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80',
  te6: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80',
  cf1: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80',
  cf2: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=500&q=80',
  cf3: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80',
  cf4: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80',
  cf5: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=500&q=80',
  cf6: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500&q=80',
  cf7: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500&q=80',
  ds1: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80',
  ds2: 'https://images.unsplash.com/photo-1488477181212-4fc5b60ee682?w=500&q=80',
  ds3: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
  ds4: '/images/item_basque_cheesecake.png',
  ds5: '/images/item_basque_cheesecake.png',
  ds6: '/images/item_brownie.png',
  ds7: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=500&q=80',
  ds8: '/images/item_matcha_tiramisu.png',
  ds9: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80',
  ds10: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80',
  ds11: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80',
  ds12: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80',
};

async function main() {
  console.log('🖼  Migrating item images into DB...');

  const items = await prisma.menuItem.findMany({
    select: { id: true, itemId: true, imageUrl: true, name: true },
  });

  let updated = 0;
  let skipped = 0;
  let noMap = 0;

  for (const item of items) {
    if (item.imageUrl) { skipped++; continue; }           // already has a URL
    const url = item.itemId ? itemImageMap[item.itemId] : null;
    if (!url) { noMap++; continue; }                       // no mapping found

    await prisma.menuItem.update({
      where: { id: item.id },
      data: { imageUrl: url },
    });
    updated++;
    console.log(`  ✓ ${item.itemId} → ${item.name}`);
  }

  console.log(`\n✅ Done — updated: ${updated}, already set: ${skipped}, no mapping: ${noMap}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
