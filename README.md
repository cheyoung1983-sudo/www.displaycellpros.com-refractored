# 🔬 Display & Cell Pros Diagnostics Hub (Triage-AI)

[![Continuous Integration](https://github.com/displaycellpros/triage-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/displaycellpros/triage-ai/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Platform Compliance](https://img.shields.io/badge/NIST_Compliance-SP_800--88_R1-008080.svg?style=flat)](https://nist.gov)
[![Security reCAPTCHA](https://img.shields.io/badge/Security-reCAPTCHA_Enterprise-blue?style=flat&logo=google-cloud)](https://cloud.google.com/recaptcha-enterprise)

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

### 4. reCAPTCHA Enterprise & Account Defender
Protects the diagnostic and booking flows from automated bot attacks and credential leaks. Integrates directly with Google Cloud's reCAPTCHA Enterprise API to score transaction risk and verify user legitimacy across all Spokane field operation endpoints.

---

## 🏛️ System Architecture

The application is structured as a high-density, hybrid multi-app workspace:

### Root Application (Main Site)
*   **Frontend:** Single Page Application (SPA) powered by **React 18**, **Vite**, **Tailwind CSS**, and **Motion**.
*   **Backend:** Robust **Express** server (`server.ts`) hosting secure proxy APIs, AI intake workflows (using the modern `@google/genai` SDK), and Firebase interactions.
*   **Databases:** **Cloud Firestore** for secure audit trails and active tickets.

### Forensic Lab Sub-Application (`/my-nextjs-project`)
*   **Framework:** **Next.js 15/16** (Turbopack) with App Router.
*   **Authentication:** **Auth0 v4** (OIDC) with server-side session management and Next.js 16 Proxy configuration.
*   **Backend Engine:** **Firebase Admin SDK** for secure, server-side laboratory operations and credentialed telemetry access.
*   **Registry:** **GCP Service Directory** for microservice discovery and metadata management.

---

## 🚀 Optimized Deployment Blueprints

### Option A: Firebase Hosting (Main Site)
The primary customer-facing portal is hosted on Firebase Hosting for maximum reliability and global CDN delivery.
*   **Target:** `https://displaycellpros-com.web.app`
*   **Deployment:** `npm run build && npx firebase-tools deploy --only hosting`

### Option B: Vercel (Next.js Sub-app)
The specialized Forensic Lab application is deployed as a standalone Vercel project with targeted build isolation.
*   **Target:** `https://displaycellproscom-refractored.vercel.app`
*   **Config:** `my-nextjs-project/vercel.json`

### Option C: Cloud Run & Docker (Containerized)
The entire platform is pre-configured for containerized deployment on Google Cloud Run.
```bash
gcloud builds submit --config cloudbuild.yaml
```

---

## 🛠️ Local Development & Operations

### 1. Prerequisites
Create a `.env` file at the root based on `.env.example` and a `.env.local` in `my-nextjs-project`:
```env
# Root Env
GEMINI_API_KEY=your_gemini_api_key
RECAPTCHA_PROJECT_ID=displaycellpros-com

# Next.js Env
AUTH0_CLIENT_ID=dead45cd-3ca8-406b-b8bb-010561b664a8
FIREBASE_PROJECT_ID=displaycellpros-com
```

### 2. Installation & Dev Start
```bash
# Main Project
npm install
npm run dev

# Next.js Lab
cd my-nextjs-project
npm install
npm run dev
```

### 3. Verification & Quality Gates
Always run quality gates before proposing commits:
```bash
# Root
npm run lint
npm run test

# Next.js Lab
cd my-nextjs-project
npm run build
```

---

## 🤖 GitHub Continuous Integration (CI)

A high-performance GitHub Actions workflow automatically executes Multiversion Environment Matrix Checks (Node.js v20/v22), Strict Linter Assessments, and Production Build Validations on every push.

---
*© 2026 Display & Cell Pros LLC. All rights reserved. Spokane/Seattle Forensic Hardware Laboratory.*
