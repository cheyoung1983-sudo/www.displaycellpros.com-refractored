# Vercel Build Fix Tasks

- [ ] Fix configuration errors
    - [ ] Remove `outputFileTracingRoot` from `next.config.js`
    - [ ] Delete redundant `next.config.mjs`
- [ ] Resolve Middleware/Proxy conflict
    - [ ] Merge `src/middleware.ts` logic into `src/proxy.ts`
    - [ ] Delete `src/middleware.ts`
- [ ] Verify build
    - [ ] Run `npm run build`
