# Secure Asset Delivery (AWS CloudFront) Implementation

I have implemented the infrastructure to support **AWS CloudFront Signed URLs** using the Key Pairs you provided. This allows the application to securely serve private assets (like forensic reports) while keeping them inaccessible to unauthorized users.

## Changes Made

### 1. New Utility: CloudFront Signer
Created [src/lib/cloudfront.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/lib/cloudfront.ts).
- Uses `@aws-sdk/cloudfront-signer` to generate cryptographically signed URLs.
- Configured to support multiple Key Pairs (Primary and Secondary).
- Implements a 1-hour default expiry for all signed links.

### 2. Environment Configuration
Updated [.env.local](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env.local).
- Added `CLOUDFRONT_KEY_PAIR_ID_1` and `_2` based on your provided files.
- Staged the `CLOUDFRONT_PRIVATE_KEY_1` variable to use **AWS Secrets Manager** resolution.

### 3. Dependencies
- Installed `@aws-sdk/cloudfront-signer` for production-grade security.

## How to Complete the Setup

> [!CAUTION]
> **Private Key Security:** I have **not** stored your private key contents in the codebase. You must secure them in AWS Secrets Manager for the system to work.

1.  **Upload to Secrets Manager:**
    - Key 1: Upload the content of `pk-LHRE6C3FQAL7HR7UKFVNA72G3G6GD5MD.pem` to a secret named `prod/cloudfront/pk-1`.
    - Key 2: Upload the content of `pk-APKAX3LBP6Q6HAW6HRI5.pem` to a secret named `prod/cloudfront/pk-2`.
2.  **Deployment:**
    - Ensure your Vercel/Cloud environment has permission to read these secrets.
3.  **Verification:**
    - You can test the signing logic in production or by running:
      ```bash
      npx tsx scripts/test-cloudfront.ts
      ```
      *(Note: Local testing will fail until the Secrets Manager bridge is active).*
