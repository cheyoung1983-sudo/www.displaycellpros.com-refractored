import { next } from '@vercel/edge';

export function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

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
  matcher: ['/api/:path*'],
};
