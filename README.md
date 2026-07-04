<div align="center">
<img width="1200" height="475" alt="Display & Cell Pros Forensic Hub" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Display & Cell Pros: Master Forensic Triage Hub

**Silicon-Layer Forensic Authority with Top-Level Expert Hardware Capabilities.**

This repository contains the source code for the Triage-AI platform, a professional mobile technical device repair laboratory system based in Spokane, WA.

## 🔬 Core Diagnostic Mandates

1.  **Symptom-to-Circuit (S2C) Mapping:** Programmatically link physical/electrical symptoms to specific logic board nodes.
2.  **Measurement-First Protocol:** Electrical verification (Diode mode, Ammeter boot current) mandatory before any thermal rework.
3.  **Chain-of-Verification (CoV):** Strict factual grounding against local source vector-PDF schematics to prevent diagnostic hallucinations.
4.  **NIST SP 800-88 R1 Compliance:** Certified data sanitization protocols for all serviced devices.

## 🛠️ Tech Stack

- **Front-end:** React 19 (Vite, TypeScript), Motion, Tailwind CSS v4
- **Back-end:** Node.js Express, Google Cloud Run (App Hosting)
- **Database:** Firebase Firestore (Durable Cloud Backups)
- **AI Intelligence:** Gemini 3.1 Pro (Schematic Reasoning), Gemini 2.5 Flash (Visual Audit)
- **DevOps:** GitHub Actions, Google Cloud Build

## 🚀 Getting Started

### Prerequisites

- Node.js (v22+)
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/cheyoung1983-sudo/www.displaycellpros.com-refractored.git
    cd www.displaycellpros.com-refractored
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file based on `.env.example`:
    ```bash
    GEMINI_API_KEY=your_key_here
    RECAPTCHA_PROJECT_ID=display-cell-pros-diagnostic
    VITE_RECAPTCHA_SITE_KEY=6LcgWy4tAAAAABP-_hU5ngbkKF5scb2DnI2_bscl
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🏗️ Deployment

### Firebase Hosting

```bash
npx firebase deploy --only hosting --project displaycellpros-com
```

### App Hosting (Backend)

App Hosting is automatically managed via GitHub push triggers to the `main` branch. 

## ⚖️ Legal & Compliance

- **WA UBI:** 605 985 265
- **D-U-N-S®:** 03-942-8174
- **NAICS:** 811210
- **Data Privacy:** NIST SP-800-88 R1 Purge Standard

---
&copy; 2026 Display & Cell Pros LLC. All Rights Reserved.
