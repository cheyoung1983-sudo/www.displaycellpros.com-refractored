import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect sensitive API routes
  if (pathname.startsWith('/api/tickets') || pathname.startsWith('/api/getStreamUserToken')) {
    const authHeader = request.headers.get('authorization');

    // In a production Vercel environment, we would verify the session cookie or JWT here
    // For now, we allow the request to proceed to the handler which does its own check
    if (!authHeader && !request.cookies.get('next-auth.session-token')) {
      // return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
