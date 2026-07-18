# Implementation Plan - Identity & Permissions Verification

Verify the "Tenant User" status and "Admin Rights" for `cheyoung1983@gmail.com` and ensure the OIDC/RDS integration is fully functional.

## User Review Required

> [!WARNING]
> To truly verify "Admin Rights" tied to your email, I would need to implement an **Identity-Aware Authorization** check. Currently, anyone who can reach the API uses the same IAM role.

## Proposed Changes

### [Component Name] Security Refinement

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/server.ts)
- Add a new endpoint `/api/admin/verify-status`.
- This endpoint will check the authenticated user's email (if provided via a Firebase ID Token) against the "Admin Email" (`cheyoung1983@gmail.com`).
- It will return the current **IAM Identity** (via `sts:GetCallerIdentity`) and **RDS Connection Status** to confirm admin capabilities.

#### [MODIFY] [App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx)
- Add an "Admin View" that only appears if `authUser.email === 'cheyoung1983@gmail.com'`.
- This view will display the results of the `/api/admin/verify-status` check.

### [Component Name] Infrastructure Validation

#### [MODIFY] [db.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/db.ts)
- Enhance logging to explicitly output which **OIDC Issuer** is being used (Vercel vs Local) to ensure the trust relationship is correct.

## Verification Plan

### Automated Tests
- I will mock a login for `cheyoung1983@gmail.com` and verify the UI shows the "Admin" badge.
- I will trigger the `/api/admin/verify-status` endpoint and analyze the response for AWS IAM Role details.

### Manual Verification
- You will need to login with your Google account.
- Check if the "Admin Portal" or similar indicator appears.
- Click "Run Identity Check" to see the live AWS role being used.
