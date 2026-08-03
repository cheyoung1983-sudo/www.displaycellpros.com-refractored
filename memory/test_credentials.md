# Test Credentials — Display & Cell Pros

## Admin (JWT email/password)
- URL: `/admin/login`
- Email: `admin@displaycellpros.com`
- Password: `DCPadmin2026`
- Role: admin

## Google Social Login (Emergent-managed)
- Any Google account can sign in via the "Continue with Google" button on `/admin/login`.
- Google users are created with role `staff` and can access the dispatch dashboard.
- No app-managed password (OAuth flow).

## Auth Endpoints
- POST `/api/auth/login` (email/password) → sets `access_token` httpOnly cookie
- POST `/api/auth/google/session` (session_id) → sets `session_token` httpOnly cookie
- GET `/api/auth/me` (protected)
- POST `/api/auth/logout`
- GET `/api/admin/bookings`, PATCH `/api/admin/bookings/{id}`, GET `/api/admin/payments` (protected)

## Stripe (test mode, claimable sandbox)
- Test card: 4242 4242 4242 4242, any future expiry, any CVC
