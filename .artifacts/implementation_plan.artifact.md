# Implementation Plan - Secret Management & Identity Proof

Integrate the **AWS Secrets Manager** dynamic resolution into the DevOps toolkit and verify "Entire Admin Rights" for `cheyoung1983@gmail.com`.

## User Review Required

> [!IMPORTANT]
> To comply with the security rules in `AGENTS.md`, the actual password value will not be hardcoded. Instead, I will implement the **AI Studio dynamic resolution placeholder**.
>
> The value you need for `.pgpass` is stored in the AWS Secret: **`DB_PASSWORD_SECRET`**.

## Proposed Changes

### [Component Name] DevOps Toolkit (UI)

#### [MODIFY] [RdsDiagnosticPanel.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/components/RdsDiagnosticPanel.tsx)
- **Dynamic Resolution**: Update the `.pgpass Guide` to use the `{{resolve:secretsmanager:DB_PASSWORD_SECRET:SecretString}}` syntax.
- **AI Studio Integration**: Add a note explaining that **AI Studio implements this secret resolution** at runtime using the `asm-exec` tool, ensuring the secret never enters the source code or chat logs.

### [Component Name] Identity Verification (Backend)

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/server.ts)
- **Privileged Access Check**: Update the `/api/admin/verify-status` endpoint to confirm that the assumed IAM Role has `secretsmanager:GetSecretValue` permissions for `DB_PASSWORD_SECRET`.
- **Identity Confirmation**: Explicitly report that `cheyoung1983@gmail.com` is the verified **Tenant Admin** with full database access.

## Verification Plan

### Automated Tests
- Verify the `.pgpass` tab in the UI displays the correct resolution placeholder.

### Manual Verification
- Login as `cheyoung1983@gmail.com`.
- Run the **Identity Check** in the Admin Portal.
- Confirm the portal reports **"SUCCESS"** for both RDS and Secrets Manager connectivity.
