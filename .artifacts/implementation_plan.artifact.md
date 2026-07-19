# Implementation Plan - Firebase Re-Integration

Restore Firebase SDK integration alongside the existing Vercel/AWS architecture to support modular access to Firestore, Authentication, and other Google services.

## User Review Required

> [!IMPORTANT]
> This reverses the "De-Google" shift for specific services. We will now have BOTH **Firebase/Firestore** and **AWS RDS** capability, allowing for hybrid data strategies.

## Proposed Changes

### 1. Environment Restoration
- **Restore Firebase Keys**: Add `VITE_FIREBASE_*` variables back to `.env` to support client-side SDK initialization.

### 2. Dependency Management
- **Install Firebase**: `npm install firebase` to add the modular web SDK.

### 3. SDK Initialization

#### [NEW] [src/lib/firebase.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/lib/firebase.ts)
- Initialize the Firebase App object using `VITE_` environment variables.
- Export `app`, `auth`, and `db` (Firestore) for application-wide use.

### 4. Firestore Integration Example

#### [MODIFY] [src/App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx)
- Implement a `FirebaseStoreTest` component or update the Lab to show a list of items (e.g., "Cities" or "Diagnostic Templates") fetched from Firestore.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the modular SDK is correctly tree-shaken by Vite.
- Verify Firebase initialization doesn't crash on boot.

### Manual Verification
- **Connection Check**: Open the Lab Portal and confirm "Firebase: Connected" status.
- **Data Fetch**: Verify that a test collection can be retrieved from Firestore.
