# Tasks - Secret Management & Identity Proof

- [x] Update .pgpass Guide with Dynamic Secrets (`RdsDiagnosticPanel.tsx`)
    - [x] Replace `my_password` with `{{resolve:secretsmanager:DB_PASSWORD_SECRET:SecretString}}`
    - [x] Add "AI Studio Implementation" note
- [x] Enhance Admin Verification API (`server.ts`)
    - [x] Add check for Secrets Manager permissions (infrastructure report)
    - [x] Update identity response with "Entire Admin Rights" confirmation
- [x] Verification
    - [x] Verify UI rendering of dynamic secret string
    - [x] Run live Admin check (manual)
