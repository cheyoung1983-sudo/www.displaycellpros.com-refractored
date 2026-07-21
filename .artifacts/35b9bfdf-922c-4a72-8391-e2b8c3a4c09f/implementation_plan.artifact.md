# Implementation Plan - Backend Stability and Performance Mitigation

The goal is to resolve recurring HTTP 500 errors on the backend and optimize frontend rendering to address render-blocking resources and layout shifts.

## User Review Required

> [!NOTE]
> I am adding a global error handler to the Express backend. This will log detailed error information to the console (visible in Vercel logs) and return a structured JSON error response instead of a generic 500 HTML page.

## Proposed Changes

### Backend Stability

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/server.ts)
- Add a global error handler (`app.use((err, req, res, next) => { ... })`) at the end of the middleware stack.
- Wrap route handlers in `try-catch` blocks where async operations (like database or AI calls) occur to prevent unhandled rejections.
- Add a catch-all route for unhandled `/api/*` requests to return a proper 404 JSON response instead of potentially crashing the Vercel bridge.

### Frontend Performance

#### [MODIFY] [index.html](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/index.html)
- Add a `preload` hint for the main CSS bundle to reduce render-blocking delay.
- Add `display=swap` to the Google Fonts URL to prevent invisible text during font loading.
- Implement the "Preload + Noscript" pattern for the main stylesheet to move it out of the critical path.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no syntax errors are introduced.
- Run `npm run build` to verify the production assets are still correctly linked.

### Manual Verification
- Review the Vercel deployment logs after push to confirm errors are being caught and logged.
- Use PageSpeed Insights or Chrome DevTools Performance tab to verify reduced render-blocking time.
