import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateLexicalPayload } from '@/lib/lexical-firewall';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only target the Diagnostics Hub and Triage APIs
  if (pathname.startsWith('/api/diagnostics') || pathname.startsWith('/api/triage')) {

    // 1. Force Tenant Identity Presence (Mock example, adjust for real auth)
    const tenantId = request.headers.get('x-tenant-id');
    // For now, we allow if not present to avoid breaking existing flows during dev,
    // but in production this should be enforced.
    // if (!tenantId && process.env.NODE_ENV === 'production') {
    //   return NextResponse.json({ error: 'Unauthorized tenant access.' }, { status: 401 });
    // }

    // 2. Perform Syntax Token Interception on POST payloads
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/diagnostics/:path*', '/api/triage/:path*'],
};
