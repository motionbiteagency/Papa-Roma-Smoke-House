import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin' ? session.user : null;
}

// POST — change admin password
export async function POST(request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword)
      return NextResponse.json({ error: 'Both fields required' }, { status: 400 });
    if (newPassword.length < 8)
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });

    const record = await prisma.admin.findUnique({ where: { email: admin.email } });
    if (!record) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, record.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({ where: { id: record.id }, data: { passwordHash: hash } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
