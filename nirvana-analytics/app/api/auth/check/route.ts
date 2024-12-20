import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.includes(path)

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect logic
  if (!token && !isPublicPath) {
    // Redirect to login if trying to access protected route without token
    return NextResponse.json({ redirect: '/login' })
  }

  if (token && isPublicPath) {
    // Redirect to home if trying to access login/register while authenticated
    return NextResponse.json({ redirect: '/' })
  }

  return NextResponse.json({ ok: true })
} 