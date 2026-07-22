# Implementation Plan - Migration to Next.js (App Router)

The goal is to migrate the entire project from a Vite + Express hybrid to a modern Next.js architecture using the App Router. This will consolidate the frontend and backend, simplify deployments, and enable native support for the Auth0 Next.js SDK.

## User Review Required

> [!IMPORTANT]
> This is a major architectural change.
> 1.  **Routing**: The single-page `activeTab` state in `App.tsx` will be replaced by file-based routing (`/services`, `/b2b`, etc.).
> 2.  **API**: All Express routes will be moved to `app/api/` routes.
> 3.  **Auth**: Firebase/Mock auth will be fully replaced by `@auth0/nextjs-auth0`.
> 4.  **Middleware**: The existing Vercel Edge middleware will be adapted to the Next.js middleware standard.

## Proposed Changes

### 1. Project Scaffolding

#### [MODIFY] [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/package.json)
- Add dependencies: `next`, `@auth0/nextjs-auth0`.
- Remove dependencies: `express`, `express-rate-limit`, `helmet`, `compression`, `vite`, `esbuild`, `tsx`, `firebase`.
- Update scripts to use `next dev`, `next build`, and `next start`.

#### [DELETE] Old Entry Points
- Delete [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/server.ts)
- Delete [vite.config.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/vite.config.ts)
- Delete [index.html](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/index.html)
- Delete `api/` directory (redundant with `app/api`).

### 2. Frontend Migration (`app/` directory)

#### [NEW] `app/layout.tsx`
- Root layout including HTML head, Google Fonts, and `UserProvider` from Auth0.
- Integrate the Google Analytics script previously in `index.html`.

#### [NEW] Page Routing
- `app/page.tsx`: Home view.
- `app/services/page.tsx`: Services view.
- `app/b2b/page.tsx`: B2B Fleet view.
- `app/store/page.tsx`: Logistics & Supply view.
- `app/privacy/page.tsx`: Privacy & Consent view.
- `app/lab/page.tsx`: Diagnostics Lab Portal (Beta).

#### [MODIFY] Components
- Move `src/components/` to the root `components/` directory.
- Update components to work with Next.js (e.g., using `next/image` if applicable, removing React-specific router logic).

### 3. Backend Migration (`app/api/` directory)

#### [NEW] API Routes
- Move logic from `server.ts` to individual `route.ts` files:
    - `app/api/health/route.ts`
    - `app/api/tax-lookup/route.ts`
    - `app/api/generate-quote/route.ts`
    - `app/api/triage/route.ts`
    - `app/api/tickets/route.ts`
    - etc.
- Implement Auth0 protection using `auth0.withApiAuthRequired()` as per your snippets.

### 4. Middleware & Utils

#### [MODIFY] [middleware.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/middleware.ts)
- Refactor to use Next.js `NextResponse` and adapt existing Edge Config/Auth protection logic.

#### [NEW] `lib/` directory
- Move `db.ts` to `lib/db.ts`.
- Create `lib/auth0.ts` to initialize the Auth0 SDK.

## Verification Plan

### Automated Tests
- Run `npm run lint`.
- Run `npm run build` to verify the Next.js production build.

### Manual Verification
- Verify all routes (`/`, `/lab`, etc.) resolve correctly.
- Test the Auth0 login flow and protected API access.
- Verify that SEO assets (Sitemap, robots.txt, manifest.json) are correctly served from the `public/` directory.
