# RDS Connection Setup Walkthrough

I have implemented the necessary components to connect your application to the RDS production database using IAM authentication.

## Changes Made

### 1. New Connection Test Script
Created [api/test-connection.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/test-connection.ts).
- This script uses the modern `@aws-sdk/rds-signer` (v3) to generate authentication tokens.
- It loads environment variables from `.env.local`.
- It performs a connection test and queries the database version.

### 3. Vercel Functions Optimization
Updated [api/lib/db.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/db.ts).
- Integrated `@vercel/functions#attachDatabasePool` to optimize connection management in serverless environments.
- Wrapped the attachment in a try-catch block to maintain compatibility with local testing environments.

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

### Connection Issues?

#### PAM authentication failed
If you see `PAM authentication failed for user "postgres"`, it means your RDS instance is rejecting the IAM token. This is almost always because the user has not been granted the `rds_iam` role.

**How to fix:**
1. Connect to your database using the master password (standard authentication).
2. Run the following SQL command:
   ```sql
   GRANT rds_iam TO postgres;
   ```
3. Ensure that **IAM Database Authentication** is enabled in the "Connectivity & security" tab of your RDS cluster in the AWS Console.

#### Could not load credentials
If you see this, ensure your terminal has the following variables set:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
