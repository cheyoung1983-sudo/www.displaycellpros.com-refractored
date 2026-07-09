# 🔬 Display & Cell Pros Diagnostics Hub (Triage-AI)

[![Continuous Integration](https://github.com/displaycellpros/triage-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/displaycellpros/triage-ai/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Platform Compliance](https://img.shields.io/badge/NIST_Compliance-SP_800--88_R1-008080.svg?style=flat)](https://nist.gov)

A high-prestige, silicon-layer hardware diagnostic portal, real-time quote builder, WA State tax compliance engine, and secure cloud platform engineered for **Display & Cell Pros LLC** (Spokane, WA). This repository utilizes deep-level hardware telemetry logic and forensic RAG intelligence to audit and diagnose mobile hardware failures, bypassing traditional unscientific guesswork.

---

## ⚡ Core Forensic & Architectural Frameworks

### 1. Symptom-to-Circuit (S2C) Mapping Engine
Our diagnostic pipeline links physical or electrical anomalies (e.g., a "0.1A static current draw") directly to specific circuit board nodes (e.g., `U4500_1610A3_TRISTAR` or `PP_LCM_BL_ANODE` Backlight boost lines). Rather than advocating for blind parts-swapping, the platform enforces:
* **The Measurement-First Protocol:** Rejects premature thermal rework. Technicians and customers are instructed to run diode-mode validation and ammeter measurements first.
* **Underfill Softening & Thermal Precision Profiles:** Guides micro-soldering rework using designated alloy formulas (SAC305 Lead-Free at 350°C–400°C) and localized air shielding.

### 2. Zero-Trust Lexical Egress Firewall
A custom Express-level gateway intercepts outbound JSON payloads and mutates forbidden consumer/hobbyist vocabulary into formal enterprise-grade lexicon (e.g., mutating "Phone Repair Shop" into "Silicon Forensic Audit Facility" or "Screwdriver" into "Precision Micro-Probing Sensor Arrays"). This guarantees compliance across automated enterprise distribution audits.

### 3. NIST SP 800-88 R1 Sanitization Engine
Implements secure cryptographic sanitization workflows. The board disposition engine signs digital tokens representing proof-of-erasure (CoE) for logic boards destined for parts-harvesting, ensuring zero data remnants remain.

### 4. Deterministic WA Combined Sales Tax Resolver
Enforces accurate, location-based sales tax calculations matching Washington State Department of Revenue rules. Includes specific Spokane County field operation ZIP codes (e.g., Spokane City, Spokane Valley, Airway Heights, Nine Mile, and Newman Lake) with corresponding localized service facility dispatches.

---

## 🏛️ System Architecture

The application is structured as a high-density full-stack hybrid application:
* **Frontend:** Single Page Application (SPA) powered by **React 18**, **Vite**, **Tailwind CSS**, and **Motion** (Animations), using **Lucide React** for icons and **Recharts** for telemetry visualizations.
* **Backend:** Robust **Express** server (`server.ts`) hosting secure proxy APIs, AI intake workflows (using the modern `@google/genai` SDK), reCAPTCHA Enterprise verification, and Firebase Admin interactions.
* **Databases:** **Cloud Firestore** for secure audit trails and active tickets.

---

## 🚀 Optimized Deployment Blueprints

This repository is pre-configured and optimized to run seamlessly on both containerized and serverless environments:

### Option A: Vercel Production Deployment (Serverless)
The codebase includes dedicated Vercel configuration files optimized for high-performance and zero-downtime routing:
* **`/vercel.json`:** Directs `/api/*` requests to Vercel's serverless runtime and serves the frontend from `/dist` with strict immutable client caching (`max-age=31536000`) for static assets.
* **`/api/index.ts`:** Bridges the module-scoped Express application from `server.ts` directly into Vercel's serverless function lifecycle.
* **SPA Routing Fallback:** Prevents 404 errors on browser refreshes by routing all non-asset requests safely back to `index.html` so React Router can resolve pages client-side.

### Option B: Cloud Run & Docker (Containerized)
The platform is fully containerized. You can build and deploy the container using Google Cloud Build:
```bash
gcloud builds submit --config cloudbuild.yaml
```

---

## 🛠️ Local Development & Operations

### 1. Prerequisites
Create a `.env` file at the root based on `.env.example`:
```env
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
# Optional Firebase variables if implementing administrative operations
```

### 2. Installation & Dev Start
Install dependencies and run the local development server:
```bash
# Install package dependencies
npm install

# Launch Vite + Express concurrently in dev mode
npm run dev
```
The server binds to port `3000` (reverse-proxied internally).

### 3. Verification & Best Practices
Always run quality gates before proposing commits:
```bash
# Run type checking and code quality gates
npm run lint

# Run unit and integration tests (Vitest)
npm run test

# Compile production-ready builds
npm run build
```

---

## 🤖 GitHub Continuous Integration (CI)

A high-performance GitHub Actions workflow is located at `.github/workflows/ci.yml`. On every `push` and `pull_request` targeting `master`, `main`, or `dev`, the pipeline automatically executes:
1. **Multiversion Environment Matrix Check:** Validates against Node.js v20 and v22.
2. **Strict Linter Assessment:** Runs TypeScript compilation check to catch any syntax or static analysis issues early.
3. **Automated Test Suites:** Runs Vitest unit and integration suites.
4. **Production Build Validation:** Verifies the bundlers successfully compile both front-end static assets and server-side esbuild bundles.
