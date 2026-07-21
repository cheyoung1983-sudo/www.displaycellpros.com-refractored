# Implementation Plan: Upgrade to reCAPTCHA Enterprise

The goal is to upgrade the reCAPTCHA integration from the legacy `siteverify` API to the modern **reCAPTCHA Enterprise API** using the `@google-cloud/recaptcha-enterprise` SDK. This provides better security and detailed risk assessments.

## User Review Required

> [!IMPORTANT]
> **Google Cloud Credentials:** The `@google-cloud/recaptcha-enterprise` library requires authentication to Google Cloud. This typically requires a Service Account Key or OIDC configured in your environment. I will implement the code, but you may need to add `GOOGLE_APPLICATION_CREDENTIALS` to your Vercel/Local environment if it's not already there.

> [!NOTE]
> **Key Update:** I will update the project to use the new keys you provided:
> - Site Key: `6LeqGV0tAAAAAC_MQbIkcyZa2L-LvTNhSlmxKaLo`
> - Project ID: `displaycellpros-com`

## Proposed Changes

### [Dependencies]

#### [MODIFY] [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/package.json)
- Add `@google-cloud/recaptcha-enterprise` dependency.

### [Environment Configuration]

#### [MODIFY] [.env.local](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env.local) & [.env](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env)
- Set `GOOGLE_CLOUD_PROJECT_ID="displaycellpros-com"`.
- Update `VITE_RECAPTCHA_SITE_KEY` with the new key.

### [Backend Integration]

#### [MODIFY] [recaptcha.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/recaptcha.ts)
- Replace legacy fetch-based verification with the `RecaptchaEnterpriseServiceClient`.
- Update `verifyRecaptcha` to accept an optional `action` name for score-based validation.

#### [MODIFY] [tickets.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/tickets.ts)
- Update the verification call to include an action name (e.g., `SUBMIT_TICKET`).

### [Frontend Integration]

#### [MODIFY] [App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx)
- Replace hardcoded `sitekey` with `import.meta.env.VITE_RECAPTCHA_SITE_KEY`.

## Verification Plan

### Automated Tests
- Run `npm run dev` and check for any build-time errors.
- (Manual) Verify the reCAPTCHA checkbox still appears and works on the login and triage pages.

### Manual Verification
- Test a ticket submission and check the server logs (or Vercel logs) to ensure the Enterprise assessment is being created successfully.
