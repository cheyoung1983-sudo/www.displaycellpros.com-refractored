# Implementation Plan - Consolidate API for Vercel Hobby Plan

The goal is to resolve the Vercel Hobby plan limit of 12 serverless functions by consolidating all API endpoints into a single Express application entry point.

## User Review Required

> [!IMPORTANT]
> I am merging all standalone serverless functions (Stream Chat tokens, persistent Tickets, etc.) into the main `server.ts` file. This ensures the entire backend runs as a single function, staying well within the Hobby plan limits while maintaining all existing features.

## Proposed Changes

### Backend Consolidation

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/server.ts)
- Add `GET /api/tickets` endpoint with database persistence support.
- Add `POST /api/getStreamUserToken` endpoint for Stream Chat integration.
- Update `POST /api/create-ticket` to use the database when configured.
- Add mock session handling to mirror the current `auth-utils.ts` logic until a full Auth solution is integrated.

### Filesystem Reorganization

#### [DELETE/MOVE] `api/*.ts` (except `index.ts`)
- Move redundant standalone functions to `api/_legacy/` to prevent Vercel from provisioning them as separate entry points.
- Move utility scripts (`setup-db.ts`, `test-connection.ts`) to the `scripts/` directory.

## Verification Plan

### Automated Tests
- Run `npm run lint` to verify combined logic and dependencies.
- Verify `vercel.json` rewrites still point to the single entry point.

### Manual Verification
- Review the consolidated `server.ts` to ensure no business logic from the standalone functions was lost.
