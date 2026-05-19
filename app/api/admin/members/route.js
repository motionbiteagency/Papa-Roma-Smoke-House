import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

// Public POST — club member signup (no admin auth needed)
export async function POST(request) {
  const body = await request.json();
  const { action } = body;

  // ── Admin actions ────────────────────────────────────────
  if (action === 'updateStatus' || action === 'delete' || action === 'setPassword') {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (action === 'updateStatus') {
      await prisma.clubMember.update({ where: { id: body.id }, data: { status: body.status } });
      return NextResponse.json({ success: true });
    }
    if (action === 'delete') {
      await prisma.clubMember.delete({ where: { id: body.id } });
      return NextResponse.json({ success: true });
    }
    if (action === 'setPassword') {
      const hash = await bcrypt.hash(body.password, 10);
      await prisma.clubMember.update({ where: { id: body.id }, data: { passwordHash: hash } });
      return NextResponse.json({ success: true });
    }
  }

  // ── Public: Create member (signup) ───────────────────────
  const { name, phone, email, preference, reason, password } = body;
  if (!name || !phone || !email || !preference || !password) {
    return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 });
  }

  const exists = await prisma.clubMember.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const member = await prisma.clubMember.create({
    data: { name, phone, email, preference, reason: reason || null, passwordHash, status: 'PENDING' },
  });
  return NextResponse.json({ success: true, memberId: member.id }, { status: 201 });
}

// Admin GET — list all members
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const members = await prisma.clubMember.findMany({
    orderBy: { joinedAt: 'desc' },
    select: {
      id: true, name: true, email: true, phone: true, preference: true,
      reason: true, status: true, membershipId: true, points: true,
      joinedAt: true, lastLoginAt: true,
    },
  });
  return NextResponse.json({ members });
}
