# Implementation Plan - Server Stability & Error Mitigation

Mitigate the widespread 500 Internal Server Errors by implementing robust error handling, detailed logging, and defensive programming across the backend API.

## User Review Required

> [!IMPORTANT]
> Since I cannot see the live Vercel logs, I am adding a **Global Error Handler** that will surface specific error messages in the API responses. This will help us identify the exact cause (e.g., missing environment variables or dependency failures).

## Proposed Changes

### [Component Name] Backend Reliability (`server.ts`)

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/server.ts)
- **Global Error Handler**: Add a middleware at the end of the chain to catch all unhandled exceptions and return them as JSON instead of generic HTML 500 pages.
- **Async Wrapper**: Wrap the `/api/admin/verify-status` and other async routes in `try...catch` blocks to ensure errors are passed to the global handler.
- **Defensive Quote Logic**: Add explicit checks for `NaN` and `undefined` in the `generate-quote` logic to prevent crashes during string formatting.
- **Middleware Refinement**: Fix the `apiPaths` logic to correctly handle nested segments like `admin/verify-status`.
- **Connectivity Health Check**: Add a `/api/health` endpoint that returns a simple `200 OK` to verify the server is running independently of external SDKs.

### [Component Name] Database Handshake (`db.ts`)

#### [MODIFY] [db.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/db.ts)
- **Sync/Async Logic**: Ensure the `password` function in the PG pool handles the IAM token acquisition correctly without blocking the event loop or throwing unhandled rejections.

## Verification Plan

### Automated Tests
- I will verify that the `/api/health` endpoint returns successfully.
- I will mock a failing database query and verify that the global error handler returns a JSON error instead of a 500 crash.

### Manual Verification
- The user should refresh the browser and check if the API endpoints now return specific error messages (e.g., `{"error": "...", "message": "..."}`) instead of a generic 500.
