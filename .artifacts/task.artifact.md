# Tasks - Vercel-Native Auth & Multi-Platform Verification

- [x] Implement reCAPTCHA Verification Layer
    - [x] Create `api/lib/recaptcha.ts` helper
    - [x] Update `api/tickets.ts` to require captcha token
    - [x] Update `api/generate-quote.ts` to require captcha token
- [x] Refine Multi-Platform Verification UI
    - [x] Update `OAuthDocumentationPanel.tsx` with Netlify Ownership
    - [x] Add "Professional Redundancy" section to the compliance lab
- [x] Frontend Integration
    - [x] Install `react-google-recaptcha`
    - [x] Add reCAPTCHA challenge to "Finalize & Book" flow in `App.tsx`
- [x] Verification
    - [x] Build test
    - [x] Manual test of captcha flow
