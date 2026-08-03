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
- P1: Auth (customer/admin portal) + admin bookings dashboard.
- P1: Real payments (Stripe) for store checkout.
- P2: AI diagnostic assistant chatbot.
- P2: Live map of lab coverage / dispatch tracking.
- P2: User-facing API error toasts; enum validation on quote inputs.
