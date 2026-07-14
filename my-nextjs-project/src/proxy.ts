import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function proxy(request: NextRequest) {
  try {
    return await auth0.middleware(request);
  } catch (error: any) {
    console.error('[S2C AUTH PROXY ERROR]:', error);

    // Return a more descriptive error in development
    return new NextResponse(
      `Forensic Auth Error: ${error.message || 'Internal Configuration Failure'}`,
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
