import { DefaultSession } from "next-auth";
import { IUser } from ".";
declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      email: string;
      avatar: string;
      firstName: string;
      lastName: string;
      bio: string;
      isVerified: boolean;
      muted: boolean;
      notificationSound: string;
      sendingSound?: string;
      contacts: IUser[];
    };
    accessToken?: string;
  }
  interface User {
    id: string;
    email: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      email: string;
    };
    accessToken: string;
  }
}