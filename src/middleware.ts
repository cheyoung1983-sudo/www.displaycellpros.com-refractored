import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware that protects routes using the NextAuth session.
 * Unauthenticated requests are redirected to the Vercel OAuth start endpoint.
 */
export async function middleware(req: NextRequest) {
  // Publicly accessible paths – skip auth
  const publicPaths = [
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/welcome',
    '/api/welcome',
  ];
  if (publicPaths.some(p => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Retrieve the JWT token (session)
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token?.accessToken) {
    // No valid session – redirect to Vercel OAuth flow
    const signInUrl = new URL('/api/auth/start', req.url);
    signInUrl.searchParams.set('userId', 'usr_123'); // optional mapping
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated – continue to the requested page/API
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth).*)'],
};
