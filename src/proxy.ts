import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { auth0 } from "./lib/auth0";

/**
 * Consolidated Middleware Proxy.
 * Handles both Auth0 v4 middleware and NextAuth session protection.
 */
export async function proxy(req: NextRequest) {
  // 1. Auth0 Middleware Execution
  // This handles Auth0 specific routes (e.g. /auth/login) and session syncing
  const auth0Response = await auth0.middleware(req);

  // If Auth0 middleware handled the request (e.g. redirect or auth endpoint), return its response
  if (auth0Response && auth0Response.status !== 200) {
    return auth0Response;
  }

  // 2. NextAuth Protection Logic
  const publicPaths = [
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/welcome',
    '/api/welcome',
    '/auth', // Auth0 default paths
  ];

  const isPublic = publicPaths.some(p => req.nextUrl.pathname.startsWith(p));
  if (isPublic) {
    return auth0Response || NextResponse.next();
  }

  // Retrieve the JWT token (NextAuth session)
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token?.accessToken) {
    // No valid NextAuth session – redirect to Vercel OAuth flow
    const signInUrl = new URL('/api/auth/start', req.url);
    signInUrl.searchParams.set('userId', 'usr_123');
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated – continue
  return auth0Response || NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for metadata and static files.
     * Also excludes Auth0 and NextAuth internal routes to prevent loops.
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth).*)",
  ],
};
