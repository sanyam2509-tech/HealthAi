import type { NextAuthOptions } from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { randomUUID } from "crypto";
import { z } from "zod";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ensureDefaultProfile } from "@/lib/profiles";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const appleEnabled = Boolean(process.env.APPLE_ID && process.env.APPLE_SECRET);

function buildHealthId() {
  return `HV-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "development-only-secret-change-me",
  session: {
    strategy: "jwt"
  },
  providers: [
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
          })
        ]
      : []),
    ...(appleEnabled
      ? [
          AppleProvider({
            clientId: process.env.APPLE_ID!,
            clientSecret: process.env.APPLE_SECRET!
          })
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() }
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await verifyPassword(parsed.data.password, user.password);

        if (!isValidPassword) {
          return null;
        }

        await ensureDefaultProfile(user.id, user.name);

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials" || !user.email) {
        return true;
      }

      const existingUser = await db.user.findUnique({
        where: { email: user.email.toLowerCase() }
      });

      if (existingUser) {
        return true;
      }

      const placeholderPassword = await hashPassword(randomUUID());

      await db.user.create({
        data: {
          name: user.name?.trim() || user.email.split("@")[0],
          email: user.email.toLowerCase(),
          password: placeholderPassword,
          healthId: buildHealthId()
        }
      });

      const createdUser = await db.user.findUnique({
        where: { email: user.email.toLowerCase() }
      });

      if (createdUser) {
        await ensureDefaultProfile(createdUser.id, createdUser.name);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
      }

       if (token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email.toLowerCase() }
        });

        if (dbUser) {
          await ensureDefaultProfile(dbUser.id, dbUser.name);
          token.sub = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

export const oauthProviders = {
  google: googleEnabled,
  apple: appleEnabled
};
