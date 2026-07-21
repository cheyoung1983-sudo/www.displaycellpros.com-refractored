# Implementation Plan - PWA Enhancement and Project Cleanup

The goal is to implement PWA (Progressive Web App) best practices and clean up the repository of redundant configuration files to streamline the Vercel deployment.

## User Review Required

> [!IMPORTANT]
> I am proposing to delete several files related to Google Cloud and Firebase Functions (`Dockerfile`, `app.yaml`, `deploy.sh`, `functions/`, etc.) that are no longer used since we consolidated the backend into a single Vercel-optimized Express app. Please confirm if you want to keep these for archival purposes before I proceed.

## Proposed Changes

### PWA Enhancements

#### [NEW] [manifest.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/public/manifest.json)
- Define app name, icons, theme colors, and display mode for "Install to Home Screen" support.

#### [MODIFY] [index.html](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/index.html)
- Link to the `manifest.json`.
- Add `theme-color` and `apple-touch-icon` meta tags.

### Project Cleanup

#### [DELETE] Redundant Deployment Configs
- Delete [Dockerfile](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/Dockerfile)
- Delete [app.yaml](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/app.yaml)
- Delete [deploy.sh](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/deploy.sh)
- Delete [metadata.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/metadata.json)

#### [DELETE] Redundant Directories
- Delete `functions/` (Legacy Firebase Functions)
- Delete `dcp-static/` and `dcp-static-cb/` (Empty node_modules containers)

### SEO & Bot Management

#### [MODIFY] [robots.txt](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/public/robots.txt)
- Add `Disallow: /api` to prevent search engines from crawling the consolidated API entry point.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the cleanup didn't remove any files needed by the build process.
- Validate `manifest.json` using a web manifest validator tool (conceptual).

### Manual Verification
- Verify the PWA manifest is correctly linked in the browser's developer tools.
- Confirm the `scripts/` directory is still present and functional (sitemap generation).
