// src/middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { proxy } from "./proxy";

/**
 * Edge Middleware entry point.
 * Delegates request handling to the existing proxy function which internally
 * invokes Auth0's middleware. Wrapping this call allows us to catch any
 * unexpected errors and ensure a valid NextResponse is always returned.
 */
export default async function middleware(request: NextRequest) {
  try {
    // The proxy function expects a generic Request; NextRequest extends it.
    const response = await proxy(request);
    // Ensure we always return a NextResponse instance.
    return response instanceof NextResponse ? response : NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Respond with a generic 500 response to avoid Vercel invocation failure.
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * Matcher configuration mirrors the one defined in src/proxy.ts.
 * It excludes static assets, images, and common metadata files.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
