# Consolidation to @auth0/nextjs-auth0

This plan will consolidate the authentication system to use the modern `@auth0/nextjs-auth0` (v4) SDK exclusively. This will resolve the "400 Bad Request" errors and configuration mismatches by removing redundant `next-auth` and manual callback logic.

## User Review Required

> [!IMPORTANT]
> **Auth0 Dashboard Actions Required**:
> To fix the "400 Bad Request" on Vercel, you **MUST** add your Vercel deployment URL to the Auth0 Dashboard:
> 1.  Go to **Auth0 Dashboard → Applications → Your App → Settings**.
> 2.  In **Allowed Callback URLs**, add: `https://displaycellproscom-refractored-a3dqpew9n-dcpllc.vercel.app/auth/callback`
> 3.  In **Allowed Logout URLs**, add: `https://displaycellproscom-refractored-a3dqpew9n-dcpllc.vercel.app`
> 4.  In **Allowed Web Origins**, add: `https://displaycellproscom-refractored-a3dqpew9n-dcpllc.vercel.app`
> 5.  Click **Save Changes**.

## Proposed Changes

### [Component Name]

Summary of what will change in this component, separated by files.

---

### Authentication Core

#### [MODIFY] [auth0.ts](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/src/lib/auth0.ts)
Update to include more robust configuration handling for Vercel.

#### [DELETE] [vercelAuth.ts](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/src/lib/vercelAuth.ts)
Remove legacy manual token exchange logic.

---

### API Routes Cleanup

#### [DELETE] [[...nextauth]/route.ts](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/src/app/api/auth/[...nextauth]/route.ts)
#### [DELETE] [callback/route.ts](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/src/app/api/auth/callback/route.ts)
#### [DELETE] [refresh/route.ts](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/src/app/api/auth/refresh/route.ts)
#### [DELETE] [signin/route.ts](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/src/app/api/auth/signin/route.ts)
#### [DELETE] [start/route.ts](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/src/app/api/auth/start/route.ts)

---

### UI Components & Pages

#### [DELETE] [signin/page.tsx](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/src/app/auth/signin/page.tsx)
Remove redundant sign-in page; Auth0 handles this via the `/auth/login` redirect.

#### [DELETE] [SignInButton.tsx](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/src/components/SignInButton.tsx)
Remove component using legacy `next-auth`.

---

### Configuration

#### [MODIFY] [.env.example](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/.env.example)
Add missing Auth0 environment variable templates.

#### [MODIFY] [package.json](file:///C:/Users/cheyo/StudioProjects/www.displaycellpros.com-refractored/package.json)
Remove `next-auth` and `@next-auth/prisma-adapter` dependencies.

## Verification Plan

### Manual Verification
1.  **Local Test**: Run `npm run dev` and verify that clicking "Sign In" correctly redirects to Auth0 and back to `/`.
2.  **Vercel Test**: Deploy to Vercel, ensure the dashboard settings are updated, and verify the login flow on the deployment URL.
