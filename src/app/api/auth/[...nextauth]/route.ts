import NextAuth, { Account, Session, TokenSet, User } from "next-auth"
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google"

type SessionBase = Omit<Session, 'user'>;

export type CustomSession = SessionBase & {
  user: {
    access_token: string
    id: string;
    name: string;
    email: string;
    image: string;
  }
};

export type CustomJWT = JWT & {
  id_token?: string;
  access_token?: string;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || "",
      idToken: true,
      authorization: {
        params: {
          scope: "openid profile email https://www.googleapis.com/auth/drive"
        }
      }
    }),
  ],
  callbacks: {
    session: async ({ session, token }: { session: Session, token: CustomJWT }): Promise<CustomSession> => {
      if (session?.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id_token,
            access_token: token.access_token
          },
        } as CustomSession;
      }
      return session as CustomSession;
    },
    async jwt({ token, user, account }: { token: JWT, user: User, account: Account | null }): Promise<CustomJWT> {
      if (account) {
        if (account.id_token) {
          token.id_token = account.id_token;
        }
        if (account.access_token) {
          token.access_token = account.access_token;
        }
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };