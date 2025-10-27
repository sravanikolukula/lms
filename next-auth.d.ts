import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  rollNo: String;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}