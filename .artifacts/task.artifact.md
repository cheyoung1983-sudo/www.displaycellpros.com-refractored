# Tasks - Vercel-Native Auth & Multi-Platform Verification

- [ ] Implement reCAPTCHA Verification Layer
    - [ ] Create `api/lib/recaptcha.ts` helper
    - [ ] Update `api/tickets.ts` to require captcha token
    - [ ] Update `api/generate-quote.ts` to require captcha token
- [ ] Refine Multi-Platform Verification UI
    - [ ] Update `OAuthDocumentationPanel.tsx` with Netlify Ownership
    - [ ] Add "Professional Redundancy" section to the compliance lab
- [ ] Frontend Integration
    - [ ] Install `react-google-recaptcha`
    - [ ] Add reCAPTCHA challenge to "Finalize & Book" flow in `App.tsx`
- [ ] Verification
    - [ ] Build test
    - [ ] Manual test of captcha flow
