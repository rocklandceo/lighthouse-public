import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getConfig } from '@/lib/config';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const config = getConfig();
      const allowedDomain = config.auth.allowedEmailDomain;

      // If no domain restriction is configured, allow all authenticated users
      if (!allowedDomain) {
        return true;
      }

      // Check if user's email matches the allowed domain
      if (user.email && user.email.endsWith(`@${allowedDomain}`)) {
        return true;
      }

      // Reject emails from other domains
      return false;
    },
    async session({ session, token }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
