import { next } from '@vercel/edge';
import { get } from '@vercel/edge-config';

export async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle /welcome route directly at the edge to reduce latency
  if (pathname === '/welcome' || pathname === '/api/welcome') {
    try {
      const greeting = await get('greeting');
      return new Response(JSON.stringify({
        greeting: greeting || "hello world",
        source: "vercel-edge-config-middleware",
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-middleware-cache': 'hit'
        }
      });
    } catch (err) {
      // Fallback to the main server if Edge Config is unavailable
      return next();
    }
  }

  // Protect sensitive API routes
  if (pathname.startsWith('/api/tickets') || pathname.startsWith('/api/getStreamUserToken')) {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie') || '';

    // In a production Vercel environment, we would verify the session cookie or JWT here
    // For now, we allow the request to proceed to the handler which does its own check
    if (!authHeader && !cookieHeader.includes('next-auth.session-token')) {
      // return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: { 'content-type': 'application/json' } });
    }
  }

  return next();
}

export const config = {
  matcher: ['/api/:path*', '/welcome'],
};
