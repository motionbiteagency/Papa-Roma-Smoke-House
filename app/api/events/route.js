import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public — save event booking
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, eventType, eventDate, guests, instructions } = body;
    if (!name || !email || !phone || !eventType || !eventDate || !guests) {
      return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 });
    }
    const booking = await prisma.eventBooking.create({
      data: {
        name, email, phone, eventType,
        eventDate: new Date(eventDate),
        guests: parseInt(guests),
        instructions: instructions || null,
      },
    });
    return NextResponse.json({ success: true, id: booking.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
