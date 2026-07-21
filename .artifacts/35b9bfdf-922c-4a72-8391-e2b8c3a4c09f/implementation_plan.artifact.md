# Implementation Plan - Edge Middleware for Dynamic Greeting

The goal is to implement the `/welcome` route using Vercel Edge Middleware and Edge Config. This allows the greeting to be served directly from the network edge, reducing latency and avoiding execution of the main Express serverless function for this specific endpoint.

## User Review Required

> [!IMPORTANT]
> Since this project is a Vite + Express hybrid (not a Next.js app), I will implement the middleware using the standard Web Fetch API (`Response`) instead of `NextResponse`. This ensures compatibility with the `@vercel/edge` runtime already in use.

## Proposed Changes

### Edge Configuration

#### [MODIFY] [middleware.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/middleware.ts)
- Import `get` from `@vercel/edge-config`.
- Update `config.matcher` to include `/welcome`.
- Add logic to intercept requests to `/welcome`.
- Fetch the `greeting` from Edge Config and return it as a JSON response directly from the Edge.

### Backend

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/server.ts)
- Keep the existing `/api/welcome` endpoint as a fallback for local development or non-middleware environments.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure middleware changes are type-safe.

### Manual Verification
- Deploy to Vercel and verify that `https://www.displaycellpros.com/welcome` returns the JSON greeting.
- Verify that standard `/api` routes still work (the middleware should correctly pass them through to the Express handler).
