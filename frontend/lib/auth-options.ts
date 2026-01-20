import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "./mongoose";import User from "@/models/user.model";
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credential",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        await connectToDatabase();
        const user = await User.findOne({ email: credentials?.email });
        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      await connectToDatabase();
      const isExitsingUser = await User.findOne({ email: session.user?.name });
      if (!isExitsingUser) {
        const user = await User.create({
          email: session.user?.email,
          isVerified: true,
          avatar: session.user?.image,
        });
        session.currentUser = user;
        return session;
      }
      session.currentUser = isExitsingUser;
      return session;
    },
  },
  session: { strategy: "jwt" },
  jwt: { secret: process.env.NEXT_PUBLIC_JWT_SECRET },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth", signOut: "/auth" },
};