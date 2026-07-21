# Implementation Plan - Vercel Deployment Best Practices

The goal is to optimize the project for Vercel deployment by implementing industry-standard security, performance, and developer experience best practices.

## User Review Required

> [!IMPORTANT]
> I am adding a suite of security headers to `vercel.json` (HSTS, CSP, X-Frame-Options, etc.). This is highly recommended for production apps but can sometimes interfere with third-party widgets if they are not explicitly allowed in the Content Security Policy (CSP).

## Proposed Changes

### Infrastructure & Security

#### [MODIFY] [vercel.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/vercel.json)
- Add a `headers` block to implement security best practices (HSTS, CSP, X-Content-Type-Options, etc.).
- Add `maxDuration` to long-running AI functions (triage, diagnostics) to prevent timeouts.

#### [NEW] [.vercelignore](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/.vercelignore)
- Add common exclusions (local logs, artifacts, large unused assets) to speed up deployment uploads.

### Backend Optimization

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/server.ts)
- Integrate `helmet` middleware for application-level security headers.
- Implement `Cache-Control` headers for idempotent GET endpoints (`/api/welcome`, `/api/movies`, `/api/rds-status`) to leverage Vercel's Edge Network.
- Add compression middleware for smaller payload transfers.

#### [MODIFY] [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/package.json)
- Add `helmet` and `compression` dependencies.

### Developer Experience

#### [NEW] [vercel-deploy.sh](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/vercel-deploy.sh)
- Create a streamlined bash script to help the user deploy via Vercel CLI, including environment variable synchronization.

#### [MODIFY] [.env.example](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/.env.example)
- Expand the example to include all necessary AWS and reCAPTCHA variables for a "batteries-included" setup.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure new middleware doesn't break types.
- Validate `vercel.json` syntax.

### Manual Verification
- Review the generated `vercel-deploy.sh` for correctness.
- Ensure security headers are logically sound for a React/Express hybrid app.
