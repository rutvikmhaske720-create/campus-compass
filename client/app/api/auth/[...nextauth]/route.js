import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }
        
        const client = await clientPromise
        const db = client.db()
        
        // Check department coordinator first
        const universityWithCoordinator = await db.collection('universities').findOne({
          'departments.coordinator.email': credentials.email
        })
        
        if (universityWithCoordinator) {
          const department = universityWithCoordinator.departments.find(
            dept => dept.coordinator.email === credentials.email
          )
          
          if (department && await bcrypt.compare(credentials.password, department.coordinator.passwordHash)) {
            return {
              id: universityWithCoordinator._id.toString(),
              email: credentials.email,
              role: 'coordinator',
              department: department.name,
              university: universityWithCoordinator.name
            }
          }
        }
        
        // Check university admin
        const university = await db.collection('universities').findOne({
          'admin.email': credentials.email
        })
        
        if (university && await bcrypt.compare(credentials.password, university.admin.passwordHash)) {
          return {
            id: university._id.toString(),
            email: credentials.email,
            role: 'admin',
            university: university.name
          }
        }
        
        return null
        } catch (error) {
          console.error('NextAuth authorize error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.department = user.department
        token.university = user.university
      }
      return token
    },
    async session({ session, token }) {
      if (!session) return session
      if (session.user) {
        session.user.role = token?.role || null
        session.user.department = token?.department || null
        session.user.university = token?.university || null
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  debug: false
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }