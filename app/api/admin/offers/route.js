import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const offers = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ offers });
}

export async function POST(request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { action, data } = await request.json();
  try {
    if (action === 'create') {
      const offer = await prisma.offer.create({
        data: {
          title: data.title,
          description: data.description || null,
          code: data.code || null,
          discount: parseFloat(data.discount) || 0,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          active: data.active ?? true,
        },
      });
      return NextResponse.json({ success: true, offer });
    }
    if (action === 'toggle') {
      await prisma.offer.update({ where: { id: data.id }, data: { active: data.active } });
      return NextResponse.json({ success: true });
    }
    if (action === 'update') {
      await prisma.offer.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description || null,
          code: data.code || null,
          discount: parseFloat(data.discount) || 0,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
        },
      });
      return NextResponse.json({ success: true });
    }
    if (action === 'delete') {
      await prisma.offer.delete({ where: { id: data.id } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
