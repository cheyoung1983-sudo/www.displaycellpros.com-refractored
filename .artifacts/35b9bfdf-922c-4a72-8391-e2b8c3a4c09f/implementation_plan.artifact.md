# Implementation Plan - Vercel Container Registry (VCR) Integration

The goal is to prepare the project for container-based deployment using Vercel Container Registry (VCR). This allows the application to run as a containerized Vercel Function.

## User Review Required

> [!IMPORTANT]
> To support VCR, I am re-introducing a `Dockerfile` (optimized as `Dockerfile.vercel`).
>
> **Note on Port Configuration**: I will update `server.ts` to listen on `process.env.PORT || 80`. Vercel's container runtime expects applications to listen on port 80 by default.

## Proposed Changes

### Infrastructure & Containerization

#### [NEW] [Dockerfile.vercel](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/Dockerfile.vercel)
- Create a multi-stage build for a Node.js 22 alpine image.
- Stage 1: Build the Vite frontend and bundle the Express server.
- Stage 2: Production runtime with minimal dependencies.

### Backend Updates

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/server.ts)
- Update the listener to use the `PORT` environment variable, defaulting to 80 for container compatibility.

### Deployment Tooling

#### [MODIFY] [vercel-deploy.sh](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/vercel-deploy.sh)
- Add a new option for **Container-based Deployment**.
- Include the `vercel vcr login docker` command and build recommendations.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the bundling logic used in the Dockerfile is valid.

### Manual Verification
- The user will need to run the `docker build` and `docker push` commands from a machine with Docker installed.
- I will provide the recommended `docker buildx` command for optimal compression and cold-start performance on Vercel.
