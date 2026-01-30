import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "./mongoose";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import User from "@/models/user.model";
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        return {
          id: user._id.toString(),
          email: user.email,
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  jwt: { secret: process.env.JWT_SECRET },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" || account?.provider === "google") {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const newUser = new User({
            email: user.email,
            name: user.name || profile?.name,
            image: user.image,
          });
          await newUser.save();
          user.id = newUser._id.toString();
        } else {
          user.id = existingUser._id.toString();
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
          expiresIn: "7d",
        });
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth", signOut: "/auth" },
};