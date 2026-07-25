# Implementation Plan: Secure Asset Delivery via AWS CloudFront

The goal is to integrate the provided AWS CloudFront Key Pairs into the project to enable secure, signed URL access for private assets (e.g., diagnostic reports or forensic data).

## User Review Required

> [!CAUTION]
> **Secret Safety:** I have detected that you provided PEM files (private keys). Per project security rules (**AGENTS.md**), I will **NOT** read the contents of these files directly into the conversation.
>
> **Action Required:**
> 1. You should upload these private keys to **AWS Secrets Manager**.
> 2. Once uploaded, provide the **Secret ID/ARN** so I can configure the application to resolve them at runtime using the `{{resolve:secretsmanager:...}}` syntax.
> 3. **NEVER** commit these `.pem` files to your Git repository.

## Proposed Changes

### [AWS Integration]

#### [NEW] [cloudfront.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/lib/cloudfront.ts)
- Implement a utility to generate **CloudFront Signed URLs**.
- Use the `aws-sdk` (already in `package.json`) or a lightweight signing library.
- Configure it to pull the `PrivateKey` from environment variables (which will be resolved from Secrets Manager).

#### [MODIFY] [.env.local](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env.local)
- Add placeholders for:
  - `CLOUDFRONT_KEY_PAIR_ID_1="LHRE6C3FQAL7HR7UKFVNA72G3G6GD5MD"`
  - `CLOUDFRONT_KEY_PAIR_ID_2="APKAX3LBP6Q6HAW6HRI5"`
  - `CLOUDFRONT_PRIVATE_KEY="{{resolve:secretsmanager:prod/cloudfront-key:SecretString:private-key}}"`

## Verification Plan

### Automated Tests
- Create a test script `scripts/test-cloudfront.ts` to verify that the signing logic correctly formats the URL.

### Manual Verification
- Attempt to access a private asset in an S3 bucket via the generated CloudFront signed URL.
