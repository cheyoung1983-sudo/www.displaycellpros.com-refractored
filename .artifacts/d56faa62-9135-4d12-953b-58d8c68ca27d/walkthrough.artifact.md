# RDS Connection Setup Walkthrough

I have implemented the necessary components to connect your application to the RDS production database using IAM authentication.

## Changes Made

### 1. New Connection Test Script
Created [api/test-connection.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/test-connection.ts).
- This script uses the modern `@aws-sdk/rds-signer` (v3) to generate authentication tokens.
- It loads environment variables from `.env.local`.
- It performs a connection test and queries the database version.

### 2. Database Library Update
Updated [api/lib/db.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/db.ts).
- Enhanced `getDbPool` to support RDS IAM authentication even when a `roleArn` is not explicitly provided (allowing for local developer credentials).
- Added a `useIAM` flag check (via `process.env.USE_RDS_IAM === "true"` or `roleArn`).

## How to Verify

### Run the Connection Test
To test the connection from your terminal, run:
```bash
npx tsx api/test-connection.ts
```

> [!IMPORTANT]
> **AWS Credentials Required:** The script currently fails with `Could not load credentials from any providers`. To fix this, you need to have active AWS credentials in your environment.
>
> You can set them temporarily in your terminal before running the script:
> ```powershell
> $env:AWS_ACCESS_KEY_ID="your_access_key"
> $env:AWS_SECRET_ACCESS_KEY="your_secret_key"
> $env:AWS_REGION="us-east-1"
> npx tsx api/test-connection.ts
> ```

### Using the Token Directly
If you already have the token string from the AWS console (the one you pasted), you can test a connection using a standard tool like `psql` or by modifying the `password` field in a simple script. However, the `api/test-connection.ts` script is designed to automate this for your full development workflow.
