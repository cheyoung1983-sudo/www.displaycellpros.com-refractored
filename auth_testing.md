# Auth Testing Playbook — Display & Cell Pros

Two auth methods secure the admin dispatch dashboard: (1) JWT email/password, (2) Emergent Google OAuth.

## JWT email/password
Admin: `admin@displaycellpros.com` / `DCPadmin2026`

```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@displaycellpros.com","password":"DCPadmin2026"}'
curl -b cookies.txt http://localhost:8001/api/auth/me
curl -b cookies.txt http://localhost:8001/api/admin/bookings
```
Login returns user + sets `access_token` cookie. `/me` and `/admin/*` work with that cookie or with `Authorization: Bearer <token>`.

## Google OAuth (Emergent-managed)
- Frontend "Continue with Google" redirects to `https://auth.emergentagent.com/?redirect=<origin>/admin`.
- Returns to `/admin#session_id=...`; `AuthCallback` posts session_id to `/api/auth/google/session`, which calls Emergent `/session-data`, creates the user (role staff), stores a 7-day session, sets `session_token` httpOnly cookie.
- To test protected pages, seed a session directly:

```
mongosh --eval "
use('displaycellpros');
var uid='test-user-'+Date.now();
var st='test_session_'+Date.now();
db.users.insertOne({user_id:uid, email:'staff.'+Date.now()+'@example.com', name:'Test Staff', role:'staff', created_at:new Date().toISOString()});
db.user_sessions.insertOne({user_id:uid, session_token:st, expires_at:new Date(Date.now()+7*24*3600*1000).toISOString(), created_at:new Date().toISOString()});
print('session_token: '+st);
"
```
Then set cookie `session_token` (domain=app host, path=/, httpOnly, secure, sameSite=None) or use `Authorization: Bearer <session_token>`.

## Notes
- get_current_admin accepts EITHER access_token (JWT) OR session_token (Google). Both grant dashboard access.
- All datetimes timezone-aware / ISO strings.
