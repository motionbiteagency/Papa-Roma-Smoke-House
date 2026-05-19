import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function isMember(session) {
  return session?.user?.role === 'member';
}

// GET own profile
export async function GET() {
  const session = await auth();
  if (!isMember(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.clubMember.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, phone: true, preference: true,
      reason: true, status: true, membershipId: true, points: true, joinedAt: true, lastLoginAt: true,
    },
  });
  return NextResponse.json({ member });
}

// PATCH — update own profile
export async function PATCH(request) {
  const session = await auth();
  if (!isMember(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, phone, preference } = await request.json();
  const member = await prisma.clubMember.update({
    where: { id: session.user.id },
    data: { name, phone, preference },
    select: { id: true, name: true, phone: true, preference: true },
  });
  return NextResponse.json({ success: true, member });
}
