import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyCredentials } from '@/actions/auth'
import type { AuthUser } from '@/types'

type AppToken = {
  id: string
  email: string
  name: string
  role: AuthUser['role']
  healthUnitId: number | null
  healthUnitName: string | null
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''

        if (!email || !password) {
          return null
        }

        const result = await verifyCredentials(
          email,
          password
        )

        if (!result.success || !result.data) {
          return null
        }

        const user = result.data

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          healthUnitId: user.healthUnitId,
          healthUnitName: user.healthUnitName,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as typeof token & Partial<AppToken>
      const appUser = user as (typeof user & Partial<AppToken>) | undefined

      if (appUser) {
        appToken.id = (appUser.id as string | undefined) ?? ''
        appToken.email = appUser.email ?? ''
        appToken.name = appUser.name ?? ''
        appToken.role = (appUser.role ?? 'viewer') as AuthUser['role']
        appToken.healthUnitId = appUser.healthUnitId ?? null
        appToken.healthUnitName = appUser.healthUnitName ?? null
      }

      return token
    },
    async session({ session, token }) {
      const appToken = token as typeof token & Partial<AppToken>

      if (session.user) {
        session.user = {
          ...session.user,
          id: appToken.id ?? '',
          email: appToken.email ?? session.user.email ?? '',
          name: appToken.name ?? session.user.name ?? '',
          role: (appToken.role ?? 'viewer') as AuthUser['role'],
          healthUnitId: appToken.healthUnitId ?? null,
          healthUnitName: appToken.healthUnitName ?? null,
        } as typeof session.user & { id: string; role: AuthUser['role']; healthUnitId: number | null; healthUnitName: string | null }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
