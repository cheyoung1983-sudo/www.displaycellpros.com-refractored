# Implementation Plan - Sitemap Best Practices

The goal is to implement a robust, standard-compliant sitemap for the Display & Cell Pros application, ensuring correct domain names, logical routes for SEO, and automated generation.

## User Review Required

> [!NOTE]
> The current `sitemap.xml` uses an incorrect domain (`displayandcellpros.com`). I will update this to the correct production domain (`www.displaycellpros.com`) found in the project's environment configuration.

## Proposed Changes

### Configuration & Scripts

#### [NEW] [generate-sitemap.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/scripts/generate-sitemap.ts)
- Create a TypeScript script to generate `public/sitemap.xml` dynamically.
- Uses `APP_URL` from environment variables.
- Includes logical routes identified from the application logic: `/`, `/services`, `/b2b`, `/store`, `/privacy`, and `/lab`.
- Automatically sets `lastmod` to the current date and defines reasonable `changefreq` and `priority` values.

#### [MODIFY] [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/package.json)
- Add a `sitemap` script: `tsx scripts/generate-sitemap.ts`.
- Add a `postbuild` hook to ensure the sitemap is updated after every production build.

### Public Assets

#### [MODIFY] [robots.txt](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/public/robots.txt)
- Update the `Sitemap` directive to point to the correct canonical URL.

#### [MODIFY] [sitemap.xml](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/public/sitemap.xml)
- Correct the domain name and structure (the automated script will manage this file going forward).

## Verification Plan

### Automated Tests
- Run `npm run sitemap` and verify the generated `public/sitemap.xml` file for valid XML syntax and correct URLs.
- Run `npm run build` to verify the `postbuild` hook executes correctly.

### Manual Verification
- Review the `robots.txt` file to ensure it correctly references the new sitemap URL.
