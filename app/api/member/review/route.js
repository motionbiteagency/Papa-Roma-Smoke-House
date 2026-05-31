import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  const session = await auth();
  
  if (!session || session.user?.role !== 'member') {
    return NextResponse.json({ error: 'Unauthorized. Only club members can submit reviews.' }, { status: 401 });
  }

  try {
    const { rating, comment } = await request.json();

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required.' }, { status: 400 });
    }

    const t = await prisma.testimonial.create({
      data: { 
        name: session.user.name || 'Anonymous Member', 
        rating: Number(rating) || 5, 
        comment: String(comment), 
        active: false // Requires admin approval
      },
    });

    revalidateTag('testimonials');
    
    return NextResponse.json({ success: true, testimonial: t });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Failed to submit review' }, { status: 500 });
  }
}
