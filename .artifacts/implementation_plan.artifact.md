# Implementation Plan - Firebase Email Link Authentication

Integrate Firebase passwordless (Email Link) authentication as a secure, low-friction identity method alongside the existing Vercel architecture.

## User Review Required

> [!IMPORTANT]
> **Action Required in Firebase Console**:
> 1. Enable **Email/Password** provider.
> 2. Enable **Email link (passwordless sign-in)**.
> 3. Add your production domain (`displaycellpros.com`) and dev URLs to **Authorized Domains**.

## Proposed Changes

### 1. Auth Context Enhancement

#### [MODIFY] [AuthContext.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/contexts/AuthContext.tsx)
- Integrate Firebase `onAuthStateChanged` to track real user sessions.
- Implement `sendSignInLink(email: string)` using `sendSignInLinkToEmail`.
- Implement `completeSignIn()` logic to handle incoming links on page load using `isSignInWithEmailLink` and `signInWithEmailLink`.
- Update `logout` to use Firebase `signOut`.

### 2. Frontend UI Integration

#### [MODIFY] [App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx)
- Update the Login Form in the Lab to support the Email Link flow.
- Add "Magic Link" status indicators (e.g., "Link sent! Check your inbox").
- Ensure the reCAPTCHA protection is applied before sending the authentication link.

### 3. Verification Handler

#### [NEW] [AuthHandler.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/components/AuthHandler.tsx)
- A transparent component that runs on application boot to check for the sign-in link in the URL and finalize authentication.

## Verification Plan

### Automated Tests
- Build verification to ensure `firebase/auth` modular imports are correctly handled.

### Manual Verification
- **Request Flow**: Enter email -> complete reCAPTCHA -> Receive "Link Sent" message.
- **Completion Flow**: Click link in email -> App opens -> Automatically signed in -> "Welcome [email]" appears in Lab.
