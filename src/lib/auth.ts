import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCredentials } from "@/actions/auth";
import type { AuthUser } from "@/types";

type AppToken = {
  id: string;
  email: string;
  name: string;
  role: AuthUser["role"];
  healthUnitId: number | null;
  healthUnitName: string | null;
};

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const result = await verifyCredentials(email, password);

        if (!result.success || !result.data) {
          return null;
        }

        const user = result.data;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          healthUnitId: user.healthUnitId,
          healthUnitName: user.healthUnitName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt(params: any) {
      const { token, user } = params;
      const appToken = token as typeof token & Partial<AppToken>;
      const appUser = user as (typeof user & Partial<AppToken>) | undefined;

      if (appUser) {
        appToken.id = (appUser.id as string | undefined) ?? "";
        appToken.email = appUser.email ?? "";
        appToken.name = appUser.name ?? "";
        appToken.role = (appUser.role ?? "viewer") as AuthUser["role"];
        appToken.healthUnitId = appUser.healthUnitId ?? null;
        appToken.healthUnitName = appUser.healthUnitName ?? null;
      }

      return token;
    },
    async session(params: any) {
      const { session, token } = params;
      const appToken = token as typeof token & Partial<AppToken>;

      if (session.user) {
        session.user = {
          ...session.user,
          id: appToken.id ?? "",
          email: appToken.email ?? session.user.email ?? "",
          name: appToken.name ?? session.user.name ?? "",
          role: (appToken.role ?? "viewer") as AuthUser["role"],
          healthUnitId: appToken.healthUnitId ?? null,
          healthUnitName: appToken.healthUnitName ?? null,
        } as typeof session.user & {
          id: string;
          role: AuthUser["role"];
          healthUnitId: number | null;
          healthUnitName: string | null;
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
