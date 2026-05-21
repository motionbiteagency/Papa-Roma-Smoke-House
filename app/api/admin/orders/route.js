import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

function adminOnly(session) {
  return session?.user?.role === 'admin';
}

async function generateOrderNumber() {
  const count = await prisma.order.count();
  return `PR-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/admin/orders?status=PENDING&search=John
export async function GET(request) {
  const session = await auth();
  if (!adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');   // optional filter
  const search = searchParams.get('search');   // optional name/phone search

  const where = {};
  if (status && status !== 'ALL') where.status = status;
  if (search) {
    where.OR = [
      { customerName:  { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search } },
      { orderNumber:   { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Badge counts per status
    const counts = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const statusCounts = {};
    for (const c of counts) statusCounts[c.status] = c._count.status;

    return NextResponse.json({ orders, statusCounts });
  } catch (err) {
    console.error('[admin/orders] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load orders.' }, { status: 500 });
  }
}

// POST /api/admin/orders  { action, data }
export async function POST(request) {
  const session = await auth();
  if (!adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { action, data } = body;

  try {
    // ── Create order manually ──────────────────────────────
    if (action === 'createOrder') {
      const { customerName, customerPhone, customerEmail, type, tableNumber,
              notes, items, discount = 0, adminNote } = data;

      if (!customerName?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
      if (!customerPhone?.trim()) return NextResponse.json({ error: 'Phone is required.' }, { status: 400 });
      if (!Array.isArray(items) || items.length === 0)
        return NextResponse.json({ error: 'Add at least one item.' }, { status: 400 });

      const validTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];
      const orderType = validTypes.includes(type) ? type : 'DINE_IN';
      const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.price) * parseInt(i.quantity)), 0);
      const total = Math.max(0, subtotal - parseFloat(discount || 0));

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
          discount: parseFloat(discount || 0),
          total,
          adminNote: adminNote?.trim() || null,
        },
      });
      return NextResponse.json({ success: true, order });
    }

    // ── Update order (status, adminNote, discount, details) ─
    if (action === 'updateOrder') {
      const { id, status, adminNote, discount, customerName, customerPhone,
              customerEmail, tableNumber, notes, items, type } = data;

      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

      const updatedItems = items ?? existing.items;
      const updatedDiscount = discount != null ? parseFloat(discount) : existing.discount;
      const subtotal = Array.isArray(updatedItems)
        ? updatedItems.reduce((s, i) => s + parseFloat(i.price) * parseInt(i.quantity), 0)
        : existing.subtotal;
      const total = Math.max(0, subtotal - updatedDiscount);

      const validStatuses = ['PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED'];
      const validTypes = ['DINE_IN','TAKEAWAY','DELIVERY'];

      const order = await prisma.order.update({
        where: { id },
        data: {
          ...(status && validStatuses.includes(status) && { status }),
          ...(type   && validTypes.includes(type)      && { type }),
          ...(adminNote  != null && { adminNote:     adminNote?.trim() || null }),
          ...(customerName  && { customerName:  customerName.trim() }),
          ...(customerPhone && { customerPhone: customerPhone.trim() }),
          ...(customerEmail != null && { customerEmail: customerEmail?.trim() || null }),
          ...(tableNumber   != null && { tableNumber:   tableNumber?.trim()   || null }),
          ...(notes         != null && { notes:         notes?.trim()         || null }),
          ...(items         != null && { items: updatedItems, subtotal, discount: updatedDiscount, total }),
        },
      });
      return NextResponse.json({ success: true, order });
    }

    // ── Delete order ────────────────────────────────────────
    if (action === 'deleteOrder') {
      const { id } = data;
      await prisma.order.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    console.error(`[admin/orders] ${action} failed:`, err);
    return NextResponse.json({ error: 'Operation failed. Please try again.' }, { status: 500 });
  }
}
