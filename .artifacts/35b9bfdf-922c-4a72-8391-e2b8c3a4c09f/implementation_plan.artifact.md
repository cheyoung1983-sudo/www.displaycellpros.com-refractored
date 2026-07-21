# Implementation Plan - CI/CD Pipeline and Windows Deployment Support

The goal is to automate the deployment process to **Vercel Container Registry (VCR)** using GitHub Actions and provide native PowerShell support for local Windows development.

## User Review Required

> [!IMPORTANT]
> To enable the GitHub Actions pipeline, you will need to add the following **Repository Secrets** in your GitHub project settings (`Settings > Secrets and variables > Actions`):
> - `VERCEL_TOKEN`: Your Vercel Access Token.
> - `VERCEL_ORG_ID`: Your Vercel Team ID (`team_zl2oSyklLa3nDVTel7ImA4rV`).
> - `VERCEL_PROJECT_ID`: Your Vercel Project ID (`prj_QKxT51u4q2771aPcCPGQMo1xJXYB`).

## Proposed Changes

### CI/CD Automation

#### [NEW] [deploy.yml](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/.github/workflows/deploy.yml)
- Create a GitHub Action that triggers on push to `main`.
- **Build Verification**: Runs `npm run build` and `npm run lint` in a clean environment.
- **Docker Buildx**: Configures Buildx for OCI-compliant builds with `zstd` compression (optimized for Vercel cold starts).
- **VCR Push**: Authenticates with Vercel and pushes the image to `vcr.vercel.com/dcpllc/www.displaycellpros.com-refractored/dcp-depository:latest`.
- **Automatic Deployment**: Triggers a Vercel deployment using the newly pushed container.

### Local Windows Support

#### [NEW] [vercel-deploy.ps1](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/vercel-deploy.ps1)
- Create a native PowerShell version of the deployment script.
- Synchronizes secrets from Vercel to local `.env.local` using the Vercel CLI.
- Provides an interactive menu for choosing between Preview and Production deployments.
- Replaces the need for `bash` or a local Docker installation for standard deployments.

## Verification Plan

### Automated Tests
- The GitHub Action itself will serve as the verification. I will review the YAML syntax for correctness.

### Manual Verification
- The user will need to push the code and check the "Actions" tab in GitHub to see the pipeline run.
- The user can test `.\vercel-deploy.ps1` in their PowerShell terminal.
