import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'inquiries.json');

function readData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read inquiries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, eventType, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const data = readData();
    const newInquiry = {
      id: `inq_${Date.now()}`,
      name,
      email,
      phone: phone || '',
      eventType: eventType || '',
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    data.inquiries.push(newInquiry);
    writeData(data);

    return NextResponse.json({ success: true, inquiry: newInquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 });
  }
}

// PATCH — persist read/unread state
export async function PATCH(request) {
  try {
    const { id, read } = await request.json();
    const data = readData();
    const idx = data.inquiries.findIndex(i => i.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    data.inquiries[idx].read = read ?? true;
    writeData(data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE — remove an inquiry
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const data = readData();
    data.inquiries = data.inquiries.filter(i => i.id !== id);
    writeData(data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
