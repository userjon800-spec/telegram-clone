import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "./mongoose";
import User from "@/models/user.model";
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credential",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        await connectToDatabase();
        let user = await User.findOne({ email: credentials?.email });
        if (!user) return null;
        return {
          id: user._id.toString(),
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
      };
      return session;
    },
  },
  session: { strategy: "jwt" },
  jwt: { secret: process.env.NEXT_PUBLIC_JWT_SECRET },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth", signOut: "/auth" },
};