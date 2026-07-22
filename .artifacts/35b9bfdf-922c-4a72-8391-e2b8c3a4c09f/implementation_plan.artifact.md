# Implementation Plan - Canonical Domain Optimization (`www`)

The goal is to set `https://www.displaycellpros.com` as the canonical entry point for the application, ensuring consistent branding and SEO across all assets.

## User Review Required

> [!NOTE]
> Although `displaycellpros.com` is technically the apex domain, you have requested `https://www.displaycellpros.com` as the primary address. I will configure the application to use this as the canonical URL for all links, sitemaps, and social sharing.

## Proposed Changes

### Domain Configuration

#### [EXECUTE] Vercel Domain Alias
- Re-add the `www.displaycellpros.com` alias to the latest production deployment.
- Ensure both the apex (`displaycellpros.com`) and the subdomain (`www.displaycellpros.com`) are active, with `www` treated as the primary canonical address in the app logic.

### Canonical Asset Updates

#### [MODIFY] [.env](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/.env) and [.env.example](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/.env.example)
- Update `APP_URL` to `https://www.displaycellpros.com`.

#### [MODIFY] [generate-sitemap.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/scripts/generate-sitemap.ts)
- Update the default `APP_URL` fallback to `https://www.displaycellpros.com`.

#### [MODIFY] [robots.txt](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/public/robots.txt)
- Update the sitemap link to `https://www.displaycellpros.com/sitemap.xml`.

#### [MODIFY] [index.html](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/index.html)
- Update `og:url` and other canonical references to use the `www` subdomain.

## Verification Plan

### Automated Tests
- Run `npm run sitemap` and verify that all URLs in `public/sitemap.xml` start with `https://www.displaycellpros.com`.
- Run `npm run build` to ensure project consistency.

### Manual Verification
- Verify that `https://www.displaycellpros.com` resolves correctly to the latest deployment.
