import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ testimonials });
}

export async function POST(request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { action, data } = await request.json();
  try {
    if (action === 'create') {
      const t = await prisma.testimonial.create({
        data: { name: data.name, image: data.image || null, rating: data.rating || 5, comment: data.comment, active: true },
      });
      return NextResponse.json({ success: true, testimonial: t });
    }
    if (action === 'toggle') {
      await prisma.testimonial.update({ where: { id: data.id }, data: { active: data.active } });
      return NextResponse.json({ success: true });
    }
    if (action === 'update') {
      await prisma.testimonial.update({
        where: { id: data.id },
        data: { name: data.name, image: data.image || null, rating: data.rating || 5, comment: data.comment },
      });
      return NextResponse.json({ success: true });
    }
    if (action === 'delete') {
      await prisma.testimonial.delete({ where: { id: data.id } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
