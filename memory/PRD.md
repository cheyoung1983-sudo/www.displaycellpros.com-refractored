# Display & Cell Pros — Futuristic 3D Website

## Problem Statement
Rebuild the GitHub repo (Display & Cell Pros — a mobile phone repair lab business) as an interactive, game-like 3D website. User choices: rebuild/redesign, React Three Fiber, futuristic theme.

## Source
Original repo: Next.js 16 + Prisma + Auth0 + Shopify (www.displaycellpros.com-refractored). Rebuilt from scratch in the standard React (CRA) + FastAPI + MongoDB stack. Business content (services, pricing formula, products, coverage cities) ported faithfully.

## Architecture
- Frontend: React 18 (CRA) + React Three Fiber + drei + framer-motion + Tailwind. Single-page scroll site.
- Backend: FastAPI + MongoDB (pymongo). All routes under /api.
- 3D hero: floating holographic phone, orbiting neon rings, particle/star field, OrbitControls auto-rotate (Scene3D.js).

## Implemented (2026-08-03)
- 3D interactive futuristic hero (cyan/magenta neon, Orbitron/Rajdhani/Share Tech Mono fonts, glassmorphism, grain overlay).
- Services section (3 repair tiers from /api/services).
- Quote Lab: interactive estimate engine — POST /api/quote returns budget/professional/authorized tiers using ported repair-logic formula.
- Store: /api/products with add-to-cart indicator.
- Booking: POST /api/bookings persists to MongoDB, returns ticket ID + quote.
- Navbar (smooth scroll, mobile menu) + Footer.
- Tested: 100% backend (6/6 pytest) and frontend (Playwright) pass.

## Iteration 3 (2026-08-03) — PayPal
- Added **PayPal Orders v2** checkout as a second payment option on each store product (alongside Stripe "Buy with Card"). Backend: `/api/paypal/config`, `/api/paypal/orders` (create), `/api/paypal/orders/{id}/capture`; server-side amounts from catalog; records to `payment_transactions` (provider=paypal). Frontend: `@paypal/react-paypal-js` buttons, graceful "SETUP REQUIRED" state when keys absent.
- **ACTION REQUIRED**: PayPal has no built-in test key. Set `PAYPAL_CLIENT_ID` + `PAYPAL_SECRET` (sandbox) in `backend/.env` to activate. Until then PayPal buttons show a disabled setup-required badge; Stripe checkout is fully functional.
- Stripe one-time-payment blueprint (product+price → Checkout Session mode=payment → checkout.session.completed webhook) is already fully satisfied by the existing Stripe implementation.

## Iteration 4 (2026-08-03) — Hardening, Security & Optimization
- **Deployment**: fixed CORS for production (credential-safe origin reflection via `CORS_ORIGINS`), gitignored `memory/test_credentials.md`. Deployment scan: PASS, no blockers.
- **Security**: removed JWT from login body (cookie-only); brute-force lockout (5 fails/15min → 429); 30-min access token + 7-day refresh (`/api/auth/refresh`, dashboard auto-refreshes on 401); Google login allowlist (`GOOGLE_ALLOWED_EMAILS/DOMAINS`); rate limits on login/bookings/chat.
- **Payments reliability**: expanded Stripe webhook (async success/fail, expired, refunded); added PayPal webhook (`/api/paypal/webhook`, PAYMENT.CAPTURE.COMPLETED, optional signature verify via `PAYPAL_WEBHOOK_ID`).
- **Data**: enum (`Literal`) validation on quote/booking/status; catalog (products+services) moved to MongoDB single source; DB indexes on startup; bad Stripe key → 404.
- **Optimization**: 3D hero pauses render when off-screen (IntersectionObserver) + mobile DPR cap + ErrorBoundary fallback; admin/payment routes code-split (React.lazy); chat 429 handled.
- **Product**: admin **Orders tab** (unified Stripe + PayPal payments); booking **notifications** recorded to `notifications` collection on create + status change (delivery MOCKED — no email/SMS provider wired).
- Verified: testing agent 25/25 backend + all frontend checks pass.

## Backlog / Next
- P2: AI assistant conversation history UI / saved transcripts.
- P2: Live map of lab coverage / dispatch tracking.
- P2: Email/SMS notifications on booking status change.

## Iteration 2 (2026-08-03) — Commerce, AI & Admin
- **Stripe Checkout** (claimable sandbox, test mode): BUY NOW on every store product → real Stripe Checkout; catalog synced via setup_stripe.py; /payment/success polls status. Tax mode: Stripe-calculates-only (automatic_tax) for physical goods.
- **AI Repair Assistant "ARC"** (Claude Sonnet 4.6, streaming SSE): floating chat widget diagnoses device issues and recommends a repair tier.
- **Admin Dispatch Control Room** (/admin): secured by TWO methods — JWT email/password (admin@displaycellpros.com) AND Emergent Google OAuth. Live booking list with status transitions, stat cards, payments view. Auth-gated with redirect.
- Verified: testing agent 100% (14/14 backend + all frontend flows).
