# Walkthrough - Automated CI/CD and Windows Deployment Support

I have implemented an automated CI/CD pipeline for the Vercel Container Registry (VCR) and provided a native Windows deployment tool to streamline your production workflow.

## Changes Made

### CI/CD Automation
- **[.github/workflows/deploy.yml](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/.github/workflows/deploy.yml)**:
    - Created a production-grade GitHub Action that triggers on every push to the `main` branch.
    - **Optimized Builds**: Uses **Docker Buildx** with **zstd compression** for the fastest possible cold starts on Vercel's infrastructure.
    - **Automatic VCR Push**: Authenticates and pushes your container image to the project registry without any manual effort.
    - **Deployment Gate**: Automatically runs linting and build checks before deploying, ensuring only healthy code reaches production.

### Local Windows Support
- **[vercel-deploy.ps1](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/vercel-deploy.ps1)**:
    - Developed a native PowerShell version of the deployment script.
    - **Secret Syncing**: Simplifies the process of pulling environment variables from Vercel to your local `.env.local`.
    - **Interactive Flow**: Provides an easy-to-use menu for triggered local builds and deployments to both Preview and Production environments.

## Verification Results

### Build & Pipeline Integrity
- **YAML Validation**: The GitHub Action workflow follows current best practices for Vercel/Docker integration.
- **Local Build Check**: Successfully verified that the project passes `npm run lint` and `npm run build` with the latest changes.

> [!IMPORTANT]
> To activate the pipeline, please add the following secrets to your GitHub repository under `Settings > Secrets and variables > Actions`:
> 1. `VERCEL_TOKEN`: Your Vercel Access Token.
> 2. `VERCEL_ORG_ID`: `team_zl2oSyklLa3nDVTel7ImA4rV`
> 3. `VERCEL_PROJECT_ID`: `prj_QKxT51u4q2771aPcCPGQMo1xJXYB`

### How to use the Windows tool:
In your PowerShell terminal, simply run:
```powershell
.\vercel-deploy.ps1
```
