// auth.js — Full Auth.js v5 config with Prisma + bcrypt
// Used by API routes and server components

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: 'admin-credentials',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const admin = await prisma.admin.findUnique({
            where: { email: String(credentials.email) },
          });
          if (!admin) return null;
          const valid = await bcrypt.compare(String(credentials.password), admin.passwordHash);
          if (!valid) return null;
          return { id: admin.id, email: admin.email, name: admin.name, role: 'admin' };
        } catch {
          return null;
        }
      },
    }),
    Credentials({
      id: 'member-credentials',
      name: 'Member',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const member = await prisma.clubMember.findUnique({
            where: { email: String(credentials.email) },
          });
          if (!member) return null;
          if (member.status === 'REJECTED' || member.status === 'SUSPENDED') return null;
          const valid = await bcrypt.compare(String(credentials.password), member.passwordHash);
          if (!valid) return null;
          await prisma.clubMember.update({
            where: { id: member.id },
            data: { lastLoginAt: new Date() },
          });
          return {
            id: member.id,
            email: member.email,
            name: member.name,
            role: 'member',
            status: member.status,
            membershipId: member.membershipId,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
