import { NextResponse, NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

/**
 * Next.js 16 proxy entry point (formerly middleware).
 * Delegates to Auth0's middleware and guarantees a valid NextResponse,
 * catching unexpected errors so an edge invocation never hard-fails.
 */
export default async function proxy(request: NextRequest) {
  try {
    const response = await auth0.middleware(request);
    return response instanceof NextResponse ? response : NextResponse.next();
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
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
