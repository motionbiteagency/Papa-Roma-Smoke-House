import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ── Admin routes ───────────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // ── Member routes ──────────────────────────────────────────
  if (pathname.startsWith('/member') && !pathname.startsWith('/member/login')) {
    if (!session || session.user?.role !== 'member') {
      return NextResponse.redirect(new URL('/member/login', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/member/:path*'],
};
