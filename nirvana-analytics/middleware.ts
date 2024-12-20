import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.includes(path)

  // Check for auth cookie instead of using getToken
  const authCookie = request.cookies.get('next-auth.session-token')?.value || 
                    request.cookies.get('__Secure-next-auth.session-token')?.value

  // Redirect logic
  if (!authCookie && !isPublicPath) {
    // Redirect to login if trying to access protected route without token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authCookie && isPublicPath) {
    // Redirect to home if trying to access login/register while authenticated
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
  ]
} 