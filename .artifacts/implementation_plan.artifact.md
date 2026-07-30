# Implementation Plan - Fix Vercel Build Errors

Resolve the build conflict between `middleware.ts` and `proxy.ts`, and fix the invalid `outputFileTracingRoot` configuration.

## User Review Required

> [!IMPORTANT]
> I will be consolidating the authentication logic from `src/middleware.ts` (NextAuth) and `src/proxy.ts` (Auth0) into a single `src/proxy.ts` file as required by the latest Next.js version (16.x) used in this project.
>
> I will also remove the Windows-specific absolute path in `next.config.js`.

## Proposed Changes

### 1. Consolidate Middleware Logic

#### [MODIFY] [src/proxy.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/proxy.ts)
- Integrate the `NextAuth` session retrieval logic from `middleware.ts` into the `proxy` function.
- Ensure that both Auth0 and NextAuth paths are handled correctly if both are intended to be active.
- Update the `matcher` to include all relevant paths from both files.

#### [DELETE] [src/middleware.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/middleware.ts)
- Remove the conflicting middleware file.

### 2. Fix Configuration

#### [MODIFY] [next.config.js](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/next.config.js)
- Remove `outputFileTracingRoot: "C:\\Users\\cheyo\\OneDrive\\Documents\\GitHub\\displaycellpros.com"`.
- This option is generally not needed on Vercel and causes errors when set to a Windows absolute path.

#### [DELETE] [next.config.mjs](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/next.config.mjs)
- Remove the redundant config file to ensure `next.config.js` is the single source of truth.

## Verification Plan

### Automated Tests
- Run `npm run build` locally to verify that the "Both middleware file and proxy file are detected" error is resolved.
- Check that the build completes without the `outputFileTracingRoot` warning.

### Manual Verification
- Deploy to Vercel and verify that the build succeeds.
- Verify that both Auth0 and NextAuth protected routes still function as expected (if applicable).
