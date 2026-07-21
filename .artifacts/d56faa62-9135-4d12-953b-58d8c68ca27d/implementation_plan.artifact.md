# Implementation Plan: Refactor Database Access to Singleton Pattern

The goal is to refactor `api/lib/db.ts` to use the latest Vercel OIDC pattern provided in your snippet. This simplifies the connection management into a singleton `pool` and provides standardized `query` and `withConnection` exports.

## User Review Required

> [!IMPORTANT]
> **API Change:** This change replaces `queryWithToken` and `getDbPool` with `query` and `withConnection`. I will need to update all call sites in the `api/` directory to ensure the app continues to function.

> [!NOTE]
> **Vercel Functions Update:** The snippet uses `@vercel/functions/oidc`. I will verify if this requires an update to the `@vercel/functions` package or if it works with the current version (`3.7.5`).

## Proposed Changes

### [Database Library]

#### [MODIFY] [db.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/db.ts)
- Replace the entire content with the provided singleton pattern.
- Use `import { awsCredentialsProvider } from "@vercel/functions/oidc";`.

### [API Handlers]

#### [MODIFY] [movies.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/movies.ts)
- Update import from `queryWithToken` to `query`.
- Update call site.

#### [MODIFY] [rds-status.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/rds-status.ts)
- Update imports and call sites.

#### [MODIFY] [tickets.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/tickets.ts)
- Update imports and call sites.

## Verification Plan

### Automated Tests
- Run `npx tsx api/test-connection.ts` (Note: I will need to update this test script as well since it relies on the old `db.ts` structure or re-implement it to test the new exports).

### Manual Verification
- Verify that the RDS diagnostics panel or any database-driven UI still loads correctly using `vercel dev`.
