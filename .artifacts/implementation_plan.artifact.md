# Implementation Plan - Total Google Removal & Vercel-Native Authentication

This plan outlines the complete removal of Google and Firebase services, transitioning to **Vercel-preferred** authentication patterns and a unified **AWS RDS** data layer.

## User Review Required

> [!CAUTION]
> **Breaking Change**: Google Sign-In and Firebase Auth will be completely removed. Users will transition to **GitHub OAuth** or **Email Magic Links**.
>
> **Vercel Preferred Method**: We will implement **Auth.js** (formerly NextAuth.js). This is the industry standard for Vercel deployments, providing a stateless, secure authentication layer that integrates directly with your **AWS RDS PostgreSQL** database.

## Proposed Changes

### 1. Dependency Cleanup
- **Uninstall**: `firebase`, `firebase-admin`, `@google-cloud/service-directory`, `@google/genai`.
- **Install**: `@auth/core`, `@auth/pg-adapter`, `resend` (for Magic Links).

### 2. AWS RDS Schema Migration
Since we are removing Firestore, we will consolidate all data in AWS RDS. I will create the following tables:
- **Auth Tables**: `users`, `accounts`, `sessions`, `verification_token` (Standard Auth.js schema).
- **Business Tables**: `tickets` (migrated from Firestore schema), `logs`.

### 3. Serverless Auth Layer

#### [NEW] [auth/[...nextauth].ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/auth/[...nextauth].ts)
- Configure Auth.js with the **Postgres Adapter** pointing to your AWS RDS instance.
- Enable **GitHub Provider** and **Email Provider** (Magic Links via Resend).

#### [NEW] [api-utils.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/api-utils.ts)
- Update to use Auth.js `getSession()` to protect routes instead of Firebase token verification.

### 4. Porting Endpoints
All routes will now verify identity via the Vercel session:
- `api/getStreamUserToken.ts`: Now uses Vercel session data.
- `api/tickets.ts`: Now reads/writes directly to AWS RDS.
- `api/triage.ts`: OpenAI implementation (Gemini code removed).

### 5. Frontend Refactoring

#### [MODIFY] [App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx)
- Remove `onAuthStateChanged` and `signInWithPopup`.
- Implement `SessionProvider` (or custom hook) to fetch session data from `/api/auth/session`.
- Replace "Cloud Backup" logic with calls to the new `/api/tickets` RDS endpoint.

## Verification Plan

### Automated Tests
- Verify that `npm run build` passes with no Firebase/Google references.
- Test the RDS schema migration script.

### Manual Verification
- **Sign In**: Verify Magic Link delivery and GitHub OAuth handshake.
- **Admin Rights**: Confirm `cheyoung1983@gmail.com` still receives Admin elevation via the new session data.
- **Persistence**: Create a ticket and confirm it appears in the AWS RDS "tickets" table.
