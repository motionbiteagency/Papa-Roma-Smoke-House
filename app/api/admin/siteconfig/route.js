import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

// GET — all config as combined object (same shape as old siteConfig.json)
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await prisma.siteConfig.findMany();
  const config = {};
  for (const row of rows) {
    config[row.key] = JSON.parse(row.value);
  }
  return NextResponse.json(config);
}

// POST — save one or all config keys
export async function POST(request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    for (const [key, value] of Object.entries(body)) {
      await prisma.siteConfig.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      });
    }
    revalidateTag('siteconfig');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
