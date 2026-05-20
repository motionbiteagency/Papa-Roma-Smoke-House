// This legacy cookie-auth route has been superseded by NextAuth (auth.js).
// All admin authentication is now handled by /api/auth/[...nextauth].
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ error: 'Gone' }, { status: 410 }); }
export async function POST() { return NextResponse.json({ error: 'Gone' }, { status: 410 }); }
export async function DELETE() { return NextResponse.json({ error: 'Gone' }, { status: 410 }); }
