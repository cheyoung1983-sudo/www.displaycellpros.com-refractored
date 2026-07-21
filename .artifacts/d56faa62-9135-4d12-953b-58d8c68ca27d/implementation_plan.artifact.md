# Implementation Plan: Fix Vercel Build Errors (Non-Next.js Middleware & Missing Types)

The goal is to resolve the Vercel build failures by correcting the middleware implementation and providing the necessary TypeScript declarations for the API handlers.

## User Review Required

> [!IMPORTANT]
> **Middleware Refactor:** I am switching `middleware.ts` from `next/server` (which is for Next.js only) to `@vercel/edge`. This is the correct way to handle middleware in a Vite/React project on Vercel.

> [!WARNING]
> **New Dependencies:** I will add `@vercel/node` and `@vercel/edge` to your `package.json`. These are required for TypeScript support in your API functions and Middleware.

## Proposed Changes

### [Dependencies]

#### [MODIFY] [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/package.json)
- Add `@vercel/node` to `devDependencies`.
- Add `@vercel/edge` to `dependencies`.

### [Middleware]

#### [MODIFY] [middleware.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/middleware.ts)
- Replace `next/server` imports with `@vercel/edge`.
- Update implementation to follow Edge Function standards.

### [API Library]

#### [MODIFY] [auth-utils.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/auth-utils.ts)
- Ensure imports from `@vercel/node` are correct (installing the package will resolve the TS error).

## Verification Plan

### Automated Tests
- Run `npm run lint` to verify that TypeScript errors are resolved locally.
- Run `vercel build` (locally) if Vercel CLI is configured, to simulate the cloud build.

### Manual Verification
- Deploy to Vercel and verify the build log shows "Build Completed" without the `next/server` error.
