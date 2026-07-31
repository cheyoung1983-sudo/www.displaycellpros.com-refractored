# Implementation Plan - Vercel Best Practice Deployment

Professionalize the repository for high-performance Vercel deployment by optimizing the deployment bundle and providing a robust CLI-based workflow.

## User Review Required

> [!IMPORTANT]
> I will be significantly expanding `.vercelignore` to exclude legacy and experimental folders (e.g., `cb001`, `functions`, `netlify`). This will dramatically speed up your deployments and prevent Vercel from scanning unrelated code.

## Proposed Changes

### 1. Optimize Deployment Payload

#### [MODIFY] [.vercelignore](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.vercelignore)
- Add all experimental and legacy project folders:
    - `cb001`, `cb7001`, `cb7002`
    - `dcp67`, `dcpkode9`
    - `netlify/`, `netlify.toml`
    - `functions/` (Legacy Firebase functions)
    - `ai-text-demo/`, `my-nextjs-project/`, `shopify-storefront/`
    - `.backup/` (Where we moved the duplicate project)
    - `api/` (Legacy root API folder)
    - `server.ts` (Legacy monolithic server)
- This ensures only the active `src/`, `public/`, and `prisma/` folders are uploaded.

### 2. Standardize Deployment Workflow

#### [NEW] [deploy_vercel.ps1](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/scripts/deploy_vercel.ps1)
- Create a professional PowerShell script to automate the recommended "Best Practice" deployment:
    1. `vercel link` (Connect)
    2. `vercel env pull` (Sync secrets)
    3. `vercel build` (Local verification)
    4. `vercel deploy --prebuilt` (Fast, verified upload)

### 3. Cleanup redundant files

#### [DELETE] [.env.vercel.refractored](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env.vercel.refractored)
- Remove stray environment files to prevent accidental leakage or confusion.

## Verification Plan

### Automated Tests
- Run `npm run build` locally after updating `.vercelignore` to ensure Next.js still has everything it needs.
- Run `vercel build` to verify that the local Vercel CLI environment correctly compiles the application.

### Manual Verification
- Execute the deployment script and verify that the "Files Uploaded" count is significantly lower.
- Check the Vercel dashboard to confirm the build succeeds without the previous conflicts.
