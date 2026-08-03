# Test Credentials — Display & Cell Pros

## Admin (JWT email/password)
- URL: `/admin/login`
- Email: `admin@displaycellpros.com`
- Password: `DCPadmin2026`
- Role: admin
- Access token now 30 min (httpOnly cookie) + 7-day refresh token; dashboard auto-refreshes on 401.
- Brute force: 5 failed logins per IP+email → 15 min lockout (429).

## Google Social Login (Emergent-managed)
- "Continue with Google" on `/admin/login`. New users get role `staff`.
- Optional allowlist: set GOOGLE_ALLOWED_EMAILS / GOOGLE_ALLOWED_DOMAINS in backend/.env to restrict. If both empty, any Google account is allowed.

## Auth Endpoints
- POST `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/google/session`, GET `/api/auth/me`
- Admin: GET `/api/admin/bookings`, PATCH `/api/admin/bookings/{id}`, GET `/api/admin/payments`, GET `/api/admin/notifications`

## Payments
- Stripe test card: 4242 4242 4242 4242. Webhook: POST `/api/stripe/webhook`.
- PayPal sandbox configured (PAYPAL_CLIENT_ID/SECRET). Webhook: POST `/api/paypal/webhook` (set PAYPAL_WEBHOOK_ID to enable signature verification).

## Rate limits
- /api/bookings: 5 / 5min per IP · /api/chat: 20 / 5min per IP · /api/auth/login: 15 / 5min per IP
