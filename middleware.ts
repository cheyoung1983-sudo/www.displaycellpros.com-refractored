import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { get, has } from '@vercel/edge-config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /welcome route directly at the edge
  if (pathname === '/welcome' || pathname === '/api/welcome') {
    try {
      if (await has('greeting')) {
        const greeting = await get('greeting');
        return NextResponse.json({
          greeting: greeting || "hello world",
          source: "vercel-edge-config-middleware",
          timestamp: new Date().toISOString()
        }, {
          headers: { 'x-middleware-cache': 'hit' }
        });
      }
    } catch (err) {
      console.error('Middleware Edge Config Error:', err);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/welcome',
    '/api/welcome',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
