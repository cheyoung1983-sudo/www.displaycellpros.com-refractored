# Project Analysis & Security Audit

This document summarizes the findings from the comprehensive audit of the **Display & Cell Pros Diagnostic Hub**.

## 1. Identified Identities
- **Admin/Contact Email**: `cheyoung1983@gmail.com`
    - Listed as **Contact Compliance Officer** in the Privacy Policy (`src/components/PrivacyPolicyView.tsx`).
    - No application-level logic currently checks this email to grant special "Admin" or "Tenant" rights.

## 2. Technical Stack & Infrastructure
- **Frontend**: Vite + React, Tailwind CSS, Firebase Client SDK.
- **Backend**: Express.js server (`server.ts`).
- **Persistence**:
    - **Google Cloud Firestore**: Stores repair tickets and user profiles. Security is strictly isolation-based (`request.auth.uid == userId`).
    - **AWS RDS PostgreSQL**: Stores application data (e.g., movies demo). Uses **IAM OIDC** for authentication via `@vercel/oidc-aws-credentials-provider`.
- **Deployment**: Dual-support for **Vercel** (primary) and **GCP Cloud Run** (documented via Docker/Shell scripts).

## 3. Security & Authorization Analysis
### AWS RDS & OIDC
- **Mechanism**: The backend uses the `AWS_ROLE_ARN` environment variable. When running on Vercel, it uses the Vercel OIDC provider to assume this role.
- **Admin Rights**: If the IAM Role has `AdministratorAccess` or high RDS privileges, the **application** effectively has admin rights. However, these are not tied to a specific user login (like `cheyoung1983@gmail.com`).

### Firebase Multi-Tenancy
- **Status**: Not actively used. While `tenantId` appears in error interfaces, there is no logic for managing multiple tenants or assigning users to specific tenant IDs.

## 4. Findings vs. User Requirements
> [!CAUTION]
> **Gap Identified**: There is currently NO code that verifies if you are logged in as `cheyoung1983@gmail.com` before granting "Admin" rights. If you expect the UI or API to behave differently for your email, this needs to be implemented.

## 5. Proposed Verification Tests
- [ ] **Environment Check**: Confirm the backend environment variables are correctly populated.
- [ ] **OIDC Handshake Test**: Verify the application can successfully exchange a Vercel token for an AWS STS token.
- [ ] **Database Connectivity**: Test if the IAM-authenticated connection can reach the RDS cluster and perform administrative queries (e.g., `SELECT version()`).
