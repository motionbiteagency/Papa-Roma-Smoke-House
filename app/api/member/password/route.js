import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const session = await auth();
  if (session?.user?.role !== 'member') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both fields required.' }, { status: 400 });
  }
  if (newPassword.length < 4) {
    return NextResponse.json({ error: 'New password too short.' }, { status: 400 });
  }

  const member = await prisma.clubMember.findUnique({ where: { id: session.user.id } });
  const valid = await bcrypt.compare(currentPassword, member.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.clubMember.update({ where: { id: session.user.id }, data: { passwordHash: hash } });
  return NextResponse.json({ success: true });
}
