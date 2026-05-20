import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const videos = await prisma.video.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ videos });
}

export async function POST(request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { action, data } = await request.json();
  try {
    if (action === 'create') {
      const count = await prisma.video.count();
      const video = await prisma.video.create({ data: { ...data, order: count } });
      revalidateTag('videos');
      return NextResponse.json({ success: true, video });
    }
    if (action === 'delete') {
      await prisma.video.delete({ where: { id: data.id } });
      revalidateTag('videos');
      return NextResponse.json({ success: true });
    }
    if (action === 'toggle') {
      await prisma.video.update({ where: { id: data.id }, data: { active: data.active } });
      revalidateTag('videos');
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
