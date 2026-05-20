import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ inquiries });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read inquiries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, phone, eventType, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }
    const inquiry = await prisma.inquiry.create({
      data: { name, email, phone: phone || null, message },
    });
    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, read } = await request.json();
    await prisma.inquiry.update({ where: { id }, data: { read: read ?? true } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.inquiry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
