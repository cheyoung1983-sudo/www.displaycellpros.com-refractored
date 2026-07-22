# Implementation Plan - Modern Auth0 "Quantum" Integration

The goal is to align the project with the Auth0 "Quantum" design and middleware proxy pattern as described in the provided guide. This leverages the `Auth0Client` and `proxy` middleware for a cleaner, more standardized integration.

## User Review Required

> [!IMPORTANT]
> This will replace the current root `app/page.tsx` (Landing Page) with the **Auth0 Login Card** design.
> I will move your existing "Driveway Lab" landing page (`HomeView`) to [**`/welcome`**](https://www.displaycellpros.com/welcome) so your marketing content is preserved.

## Proposed Changes

### 1. Auth0 Configuration & Proxy

#### [MODIFY] [lib/auth0.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/lib/auth0.ts)
- Switch from `initAuth0` to the modern `Auth0Client` from `@auth0/nextjs-auth0/server`.
- This enables zero-config initialization from environment variables.

#### [NEW] [proxy.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/proxy.ts)
- Implement the Auth0 middleware proxy to handle authentication handshakes at the edge.

#### [MODIFY] [middleware.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/middleware.ts)
- Integrate the new `proxy` logic with your existing Edge Config handling.

### 2. UI Components ("Quantum" Design)

#### [NEW] [components/LoginButton.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/components/LoginButton.tsx)
#### [NEW] [components/LogoutButton.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/components/LogoutButton.tsx)
#### [NEW] [components/Profile.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/components/Profile.tsx)
- Implement the styled components provided in the guide using the "Quantum" aesthetic (blur-3xl, glassmorphism, etc.).

### 3. Page Refactoring

#### [MODIFY] [app/page.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app/page.tsx)
- Replace current home page with the centralized Auth0 Login/Profile dashboard.

#### [NEW] [app/welcome/page.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app/welcome/page.tsx)
- Re-host the `HomeView` here to maintain your public-facing marketing lab portal.

#### [MODIFY] [app/layout.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app/layout.tsx)
- Update `UserProvider` to `Auth0Provider` from the client SDK.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the new `Auth0Client` and `proxy` patterns are compiled correctly.
- Verify TypeScript types for the `auth0.middleware` call.

### Manual Verification
- Verify that the home page renders the Auth0 "Quantum" card.
- Test login/logout using the new buttons.
- Confirm `/welcome` still displays the original mobile lab marketing content.
