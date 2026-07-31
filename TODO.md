# Deployment Preparation: Final Manual Steps

The project build is currently stabilized after major dependency upgrades and configuration fixes. The following manual steps are required to resolve the remaining 3 TypeScript errors before successful deployment.

## 1. Fix Component Imports
The components are failing to import constants because they are attempting to import from `src/lib/constants` (a file that does not exist or has no exports) instead of `src/lib/constants.tsx`.

- **File:** `src/components/ServicesView.tsx`
  - Change: `import { SERVICES } from '@/lib/constants';`
  - To: `import { SERVICES } from '@/lib/constants.tsx';`
- **File:** `src/components/StoreView.tsx`
  - Change: `import { STORE_PRODUCTS } from '@/lib/constants';`
  - To: `import { STORE_PRODUCTS } from '@/lib/constants.tsx';`

## 2. Resolve Vercel Auth OIDC Import
The build is failing because `createSigner` is not found on `@vercel/functions/oidc`.

- **File:** `src/lib/vercelAuth.ts`
- **Action:** Review the `@vercel/functions` library documentation to verify the correct import path and usage for the `createSigner` function in the currently installed version (`^3.7.6`). Update the import in line 25 accordingly.

## 3. Final Deployment
Once the above steps are completed:
1. Run `npx tsc --noEmit` to verify 0 errors.
2. Run `npm run build` to verify production build success.
3. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```
