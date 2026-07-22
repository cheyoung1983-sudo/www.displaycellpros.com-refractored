# Implementation Plan - Auth0 Best Practices for Next.js

The goal is to refine the Auth0 integration to follow the latest Next.js 15 and App Router best practices, including zero-config environment variables, server-side protection, and standardized authentication routes.

## User Review Required

> [!IMPORTANT]
> I am switching to the standard `@auth0/nextjs-auth0` imports for App Router. This removes the need for a custom client instance in most cases and leverages Next.js's built-in security features.
>
> **Secrets Needed**: Please ensure the following are set in your environment (I will update `.env.local` with the values you provided):
> - `AUTH0_SECRET`: A 32+ character random string.
> - `AUTH0_BASE_URL`: `https://www.displaycellpros.com`
> - `AUTH0_ISSUER_BASE_URL`: `https://icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com`
> - `AUTH0_CLIENT_ID`: `iHyCQzrHYenv4lrkCFy4v9528jtJUUHl`
> - `AUTH0_CLIENT_SECRET`: `[Provided Secret]`

## Proposed Changes

### Configuration

#### [MODIFY] [.env.local](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/.env.local)
- Add/Update standard Auth0 environment variables to enable zero-config SDK features.

### Frontend Security (`app/` directory)

#### [MODIFY] [app/lab/page.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app/lab/page.tsx)
- Wrap the page export with `withPageAuthRequired`.
- Remove legacy mock login/sign-out logic and bypass buttons.
- Use `user` from `withPageAuthRequired` (Server Component) or `useUser` (Client Component) consistently.

### API Security (`app/api/` directory)

#### [MODIFY] [app/api/tickets/route.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app/api/tickets/route.ts)
- Refactor to use `withApiAuthRequired` for automatic protection and session retrieval.

### UI Enhancements

#### [MODIFY] [components/Navbar.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/components/Navbar.tsx)
- Update "Book Mission" and profile links to use standard `/api/auth/login` and `/api/auth/logout` routes.
- Integrate the `useUser` hook to show/hide authentication-related UI elements.

## Verification Plan

### Automated Tests
- Run `npm run build` and `npm run lint`.
- Verify that the Auth0 routes are correctly provisioned.

### Manual Verification
- Test the login flow: navigate to `/lab`, verify redirect to Auth0, login, and verify return to `/lab`.
- Test the logout flow: click logout and verify session termination.
- Verify that API routes return `401` when accessed without an active session.
