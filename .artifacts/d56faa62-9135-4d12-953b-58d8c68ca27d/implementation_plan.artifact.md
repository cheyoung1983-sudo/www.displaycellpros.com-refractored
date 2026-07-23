# Implementation Plan: Vercel + Aurora PostgreSQL Integration (Final Steps)

The goal is to finalize the Aurora PostgreSQL integration by setting up the `comments` table, implementing the modern database access pattern, and creating a page to display comments.

## User Review Required

> [!IMPORTANT]
> **Page Replacement:** The guide suggests updating `page.tsx`. In your current project, `src/app/page.tsx` is your Auth0 Login Portal. I will create a new route at `src/app/comments/page.tsx` to preserve your portal while fulfilling the guide's requirements.
>
> **Database Credentials:** This implementation relies on `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`, and `AWS_ROLE_ARN` being correctly set in your environment.

## Proposed Changes

### [Database Setup]

#### [NEW] [setup-comments.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/scripts/setup-comments.ts)
- A one-time script to create the `comments` table in RDS using your existing IAM credentials.

### [Database Library]

#### [MODIFY] [db.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/lib/db.ts)
- Replace the existing logic with the provided singleton pattern using `@vercel/functions/oidc`.
- Export `query` and `withConnection` as standardized access functions.

### [Frontend]

#### [NEW] [page.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/app/comments/page.tsx)
- Create a new page that fetches and displays records from the `comments` table.
- Implements the "Next.js + Aurora PostgreSQL" UI from the guide.

## Verification Plan

### Automated Tests
- Run the setup script to confirm table creation.
- Run `npm run build` to ensure the new `comments` route and `db.ts` refactor are valid.

### Manual Verification
1. Start the app with `npm run dev`.
2. Navigate to `http://localhost:3000/comments`.
3. Verify that the "Next.js + Aurora PostgreSQL" heading is visible and (if data exists) comments are displayed.
