import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        const db = await getDb()
        const user = await db.collection('users').findOne({ 
          email: credentials.email 
        })

        if (!user) {
          throw new Error('No user found with this email')
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          throw new Error('Incorrect password')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
} 