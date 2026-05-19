// auth.config.js — Edge-compatible config (no Prisma, no bcrypt)
// Used by middleware.js only

import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    Credentials({ id: 'admin-credentials', name: 'Admin', credentials: {} }),
    Credentials({ id: 'member-credentials', name: 'Member', credentials: {} }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.status = user.status;
        token.membershipId = user.membershipId;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.status = token.status;
        session.user.membershipId = token.membershipId;
      }
      return session;
    },
  },
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
};
