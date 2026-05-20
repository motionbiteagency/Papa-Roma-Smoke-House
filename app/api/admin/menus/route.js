import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

// GET — full menus tree
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const menuTypes = await prisma.menuType.findMany({
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
  });
  return NextResponse.json({ menuTypes });
}

// POST — save one menu item (add/edit/delete via action)
export async function POST(request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { action, data } = await request.json();

  try {
    if (action === 'addItem') {
      const item = await prisma.menuItem.create({ data });
      revalidateTag('menus');
      return NextResponse.json({ success: true, item });
    }
    if (action === 'updateItem') {
      const { id, ...rest } = data;
      const item = await prisma.menuItem.update({ where: { id }, data: rest });
      revalidateTag('menus');
      return NextResponse.json({ success: true, item });
    }
    if (action === 'deleteItem') {
      await prisma.menuItem.delete({ where: { id: data.id } });
      revalidateTag('menus');
      return NextResponse.json({ success: true });
    }
    if (action === 'toggleFeatured') {
      const item = await prisma.menuItem.update({
        where: { id: data.id },
        data: { featured: data.featured },
      });
      revalidateTag('menus');
      return NextResponse.json({ success: true, item });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
