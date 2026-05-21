import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Generate sequential order number: PR-0001, PR-0002 …
async function generateOrderNumber() {
  const count = await prisma.order.count();
  return `PR-${String(count + 1).padStart(4, '0')}`;
}

// POST /api/orders — public, called from the cart checkout step
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { customerName, customerPhone, customerEmail, type, tableNumber, notes, items } = body;

  // Validate required fields
  if (!customerName?.trim())  return NextResponse.json({ error: 'Name is required.'  }, { status: 400 });
  if (!customerPhone?.trim()) return NextResponse.json({ error: 'Phone is required.' }, { status: 400 });
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: 'Order must have at least one item.' }, { status: 400 });

  const validTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];
  const orderType = validTypes.includes(type) ? type : 'DINE_IN';

  // Calculate totals from items snapshot
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const total = subtotal; // no discount on customer-placed orders

  try {
    const orderNumber = await generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        type: orderType,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail?.trim() || null,
        tableNumber: tableNumber?.trim() || null,
        notes: notes?.trim() || null,
        items,
        subtotal,
        discount: 0,
        total,
      },
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, id: order.id });
  } catch (err) {
    console.error('[orders] create failed:', err);
    return NextResponse.json({ error: 'Failed to place order. Please try again.' }, { status: 500 });
  }
}
