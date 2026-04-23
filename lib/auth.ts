import NextAuth from 'next-auth';
import Github from 'next-auth/providers/github';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  throw new Error('Missing github oauth credentials');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Github({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

      if (!ADMIN_EMAIL) {
        throw new Error('Missing admin email');
      }

      return user?.email === ADMIN_EMAIL;
    },
  },
});
