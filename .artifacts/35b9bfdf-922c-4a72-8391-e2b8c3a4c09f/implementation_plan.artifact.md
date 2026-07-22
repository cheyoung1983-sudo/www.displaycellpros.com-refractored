# Implementation Plan - Resource Blocking and API Stability Mitigation

The goal is to resolve CSP violations related to the Web App Manifest and investigate/fix recurring HTTP 500 errors on API endpoints.

## User Review Required

> [!IMPORTANT]
> I am updating the Content Security Policy (CSP) to allow manifests from `https://vercel.com`. This is necessary when using Vercel features like Deployment Protection or SSO, which can redirect manifest requests.

## Proposed Changes

### Infrastructure & Security (`vercel.json`)

#### [MODIFY] [vercel.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/vercel.json)
- Add `manifest-src 'self' https://vercel.com;` to the Content-Security-Policy header.
- This will resolve the "Blocked (CSP)" issue identified in the diagnostic report.

### Backend Stability (`server.ts`)

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/server.ts)
- Add `app.set('trust proxy', 1);`. This is critical for `express-rate-limit` to work correctly behind Vercel's proxy. Without it, the rate limiter may fail or incorrectly block traffic.
- Enhance the global error handler to provide even more detail in the server logs (stack traces) while keeping the client response clean.
- Add "Request Context" logging to the 500-failing routes (`/api/pos-sync-logs`, `/api/generate-quote`, `/api/tax-lookup`) to verify if the issue is related to body parsing or middleware execution.

## Verification Plan

### Automated Tests
- Run `npm run build` and `npm run lint` to ensure no regression.

### Manual Verification
- Review Vercel logs after deployment to see the new detailed error traces if 500s persist.
- Verify in the browser console that the CSP violation for `manifest.json` is resolved.
