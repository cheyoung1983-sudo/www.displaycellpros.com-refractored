# Tasks - Server Stability & Error Mitigation

- [x] Implement Global Error Handler (`server.ts`)
- [x] Refactor Routes for Async Safety
    - [x] Wrap `/api/admin/verify-status`
    - [x] Wrap `/api/triage` (more robustly)
    - [x] Wrap `/api/generate-quote`
    - [x] Wrap `pos-sync` endpoints
- [x] Fix Middleware Routing Logic
- [x] Add `/api/health` Endpoint
- [x] Refine `db.ts` Handshake Logic
- [x] Verification
    - [x] Checked API response format on failure
    - [x] Confirmed health check success
