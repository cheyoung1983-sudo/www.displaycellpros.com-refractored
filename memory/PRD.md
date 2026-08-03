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

## Backlog / Next
- P2: AI assistant conversation history UI / saved transcripts.
- P2: Live map of lab coverage / dispatch tracking.
- P2: Email/SMS notifications on booking status change.

## Iteration 2 (2026-08-03) — Commerce, AI & Admin
- **Stripe Checkout** (claimable sandbox, test mode): BUY NOW on every store product → real Stripe Checkout; catalog synced via setup_stripe.py; /payment/success polls status. Tax mode: Stripe-calculates-only (automatic_tax) for physical goods.
- **AI Repair Assistant "ARC"** (Claude Sonnet 4.6, streaming SSE): floating chat widget diagnoses device issues and recommends a repair tier.
- **Admin Dispatch Control Room** (/admin): secured by TWO methods — JWT email/password (admin@displaycellpros.com) AND Emergent Google OAuth. Live booking list with status transitions, stat cards, payments view. Auth-gated with redirect.
- Verified: testing agent 100% (14/14 backend + all frontend flows).
