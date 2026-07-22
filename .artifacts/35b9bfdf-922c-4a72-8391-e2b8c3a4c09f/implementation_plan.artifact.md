# Implementation Plan - Fix Vercel Build Failure (OpenAI Credentials)

The goal is to resolve the Vercel build failure caused by top-level initialization of the OpenAI client without an API key during the build phase. We will also address build-time warnings from the Auth0 SDK and ensure API routes are correctly handled as dynamic.

## User Review Required

> [!IMPORTANT]
> The OpenAI SDK throws a fatal error during build because it attempts to validate the `OPENAI_API_KEY` at the module level. I will refactor the code to initialize the client lazily only when a request is made.
>
> I will also add `export const dynamic = 'force-dynamic'` to the affected API routes to prevent Next.js from attempting to statically optimize them during build, which can trigger these credential checks.

## Proposed Changes

### API Routes

#### [MODIFY] [app/api/triage/route.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app/api/triage/route.ts)
- Move `new OpenAI(...)` initialization inside a helper function or the `POST` handler.
- Add `export const dynamic = 'force-dynamic';`.

#### [MODIFY] [app/api/tickets/route.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app/api/tickets/route.ts)
- Add `export const dynamic = 'force-dynamic';` to ensure it doesn't attempt static analysis of the database/auth logic during build.

#### [MODIFY] [app/api/generate-quote/route.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app/api/generate-quote/route.ts)
- Add `export const dynamic = 'force-dynamic';`.

#### [MODIFY] [app/api/tax-lookup/route.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app/api/tax-lookup/route.ts)
- Add `export const dynamic = 'force-dynamic';`.

### Auth0 Configuration

#### [MODIFY] [lib/auth0.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/lib/auth0.ts)
- Add a defensive check or lazy initialization for `Auth0Client` if warnings persist, though primarily focusing on OpenAI as it is the fatal build error.

## Verification Plan

### Automated Tests
- Run `npm run build` locally without `.env` keys (or with dummy keys) to verify the build no longer crashes.

### Manual Verification
- Deploy to Vercel and confirm the build succeeds.
- Verify the `/api/triage` endpoint still works correctly in the preview environment.
