# Implementation Plan - Vercel-Native Auth & Multi-Platform Verification

Complete the migration to a stateless Vercel-Native architecture, implement a secure authentication layer using Vercel-preferred patterns (Auth.js), and integrate multi-provider domain verification (OpenAI, Vercel, Netlify) with reCAPTCHA bot protection.

## User Review Required

> [!CAUTION]
> **Identity Shift**: We are removing Firebase Auth and Google Sign-In entirely. We will transition to **Auth.js** with **GitHub OAuth** and **Email Magic Links**.
>
> **Bot Protection**: Per your request, we are integrating the **Legacy reCAPTCHA** service. While we are "De-Googling" the identity layer, reCAPTCHA remains for professional-grade bot mitigation on public forms.

## Proposed Changes

### 1. Environment & Secret Management
- **reCAPTCHA Configuration**:
    - Backend: Use the provided Secret Key (`6LcIwSUt...`) via a `RECAPTCHA_SECRET_KEY` environment variable.
    - Frontend: Use the existing Site Key (`6LcgWy4t...`).

### 2. Backend Security Layer

#### [NEW] [api/lib/recaptcha.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/recaptcha.ts)
- Implement a server-side verification helper using the Vercel-native `fetch` API to validate reCAPTCHA tokens against `https://www.google.com/recaptcha/api/siteverify`.

#### [MODIFY] [api/tickets.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/tickets.ts) & [api/generate-quote.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/generate-quote.ts)
- Update POST handlers to require a `captchaToken` in the request body.
- Return a `403 Forbidden` if the captcha verification fails.

### 3. Frontend Bot Mitigation

#### [MODIFY] [App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx)
- Install and integrate `react-google-recaptcha`.
- Wrap the **"Finalize & Book Now"** and **"Back up Quote"** actions with a reCAPTCHA challenge to prevent automated abuse.

### 4. Professional Redundancy (Compliance Lab)

#### [MODIFY] [OAuthDocumentationPanel.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/components/OAuthDocumentationPanel.tsx)
- Add a dedicated **Redundancy & Best Practices** section.
- Explicitly list **Vercel Edge**, **Netlify CDN**, and **OpenAI Verification** as part of a high-availability professional deployment strategy.

## Verification Plan

### Automated Tests
- Run build to verify no remaining Firebase imports.
- Mock the reCAPTCHA API response to test successful and failed verification flows.

### Manual Verification
- **Challenge Test**: Trigger a repair quote and ensure the reCAPTCHA widget appears before booking.
- **Redundancy Check**: Navigate to the Lab Portal and verify all 4 providers (Google, OpenAI, Vercel, Netlify) show as "Active/Verified".
