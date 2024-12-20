import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './auth' // We'll use the new Next-Auth v5 approach

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.includes(path)

  // Use the new auth() function instead of getToken
  const session = await auth()

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/results',
    '/api/results/:path*',
    '/api/generate-report/:path*',
    '/api/analyze/:path*',
  ],
} 