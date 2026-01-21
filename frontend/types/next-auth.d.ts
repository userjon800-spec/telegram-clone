import { DefaultSession } from "next-auth";
import { IUser } from ".";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
    };
  }
}