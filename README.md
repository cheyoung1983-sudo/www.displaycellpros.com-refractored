<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />

[![Netlify Status](https://api.netlify.com/api/v1/badges/010e7c28-bc7a-4735-b252-d4da98c9c9f3/deploy-status)](https://app.netlify.com/projects/displaycellpros/deploys)
</div>

# Display & Cell Pros Diagnostic Hub

Professional mobile technical service laboratory. Combat-veteran owned, operating in strict compliance with Washington State's Right to Repair laws.

## Platform Architecture

- **Primary Engine**: Vercel Serverless (Node.js)
- **AI Triage**: OpenAI GPT-4o
- **Data Layer**: AWS RDS PostgreSQL / Vercel Postgres (Neon)
- **Identity**: Firebase Auth (Mobile) / Auth.js (Web)
- **Redundancy**: Dual-CDN (Vercel + Netlify)

## Run Locally

**Prerequisites:** Node.js 18+, Vercel CLI

1. Install dependencies:
   `npm install`
2. Configure environment:
   `cp .env.example .env` (Add your `OPENAI_API_KEY`)
3. Run the app:
   `npm run dev`
