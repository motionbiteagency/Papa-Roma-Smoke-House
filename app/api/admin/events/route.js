import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bookings = await prisma.eventBooking.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ bookings });
}

export async function POST(request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { action, data } = await request.json();
  try {
    if (action === 'updateStatus') {
      await prisma.eventBooking.update({
        where: { id: data.id },
        data: { status: data.status, adminNote: data.adminNote || null },
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
