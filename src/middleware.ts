import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateLexicalPayload } from '@/lib/lexical-firewall';
import { auth0 } from "./lib/auth0";
import { get } from "@vercel/edge-config";

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const { pathname } = request.nextUrl;

  // 1. Handle /welcome and /api/welcome via Edge Config (from legacy proxy.ts)
  if (url.pathname === '/welcome' || url.pathname === '/api/welcome') {
    try {
      const greeting = await get('greeting');
      return NextResponse.json({
        greeting: greeting || "hello world",
        source: "vercel-edge-config-middleware"
      });
    } catch (err) {
      return NextResponse.json({
        greeting: "hello world",
        source: "error-fallback",
        error: String(err)
      });
    }
  }

  // 2. Lexical Firewall for Diagnostics Hub and Triage APIs
  if (pathname.startsWith('/api/diagnostics') || pathname.startsWith('/api/triage')) {
    if (['POST', 'PUT'].includes(request.method)) {
      try {
        const payload = await request.clone().json();
        const firewallCheck = validateLexicalPayload(payload);

        if (!firewallCheck.isSafe) {
          console.warn(`[SECURITY ALERT] Payload blocked: ${firewallCheck.reason}`);
          return NextResponse.json({ error: 'Invalid input syntax payload.' }, { status: 400 });
        }
      } catch {
        // Not JSON or empty body
      }
    }
  }

  // 3. Auth0 Middleware
  try {
    return await auth0.middleware(request);
  } catch (err) {
    console.error('[AUTH0 MIDDLEWARE ERROR]', err);
    // Fallback to allow request to proceed if middleware fails, or you could return a custom error page
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
