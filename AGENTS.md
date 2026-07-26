# AWS Guidance
- Prefer the AWS MCP Server for AWS interactions — it provides sandboxed
  execution, observability, and audit logging. If unavailable, use the
  AWS CLI directly.
- Before starting a task, check whether a relevant AWS skill is available.
  Load the skill with `retrieve_skill` and prefer its guidance over
  general knowledge.
- When uncertain about specific AWS details (API parameters, permissions,
  limits, error codes), verify against documentation rather than guessing.
  State uncertainty explicitly if you cannot confirm.
- When creating infrastructure, prefer infrastructure-as-code (AWS CDK or
  CloudFormation) over direct CLI commands.
- When working with infrastructure, follow AWS Well-Architected Framework
  principles.
- Do not use em dashes in AWS resource names or descriptions. Use
  hyphens instead.

## Secret Safety
- MUST load the `aws-secrets-manager` skill first for any secret,
  credential, API key, token, or password task. MUST NOT call
  `secretsmanager get-secret-value` or `batch-get-secret-value`, and MUST
  not hit the Secrets Manager Agent daemon directly. MUST use
  `{{resolve:secretsmanager:secret-id:SecretString:json-key}}` with
  `asm-exec` so the secret resolves at runtime without entering context.

# Vercel & AI Gateway Guidance
- Use Vercel CLI (`vc` or `vercel`) to manage Vercel projects and AI Gateway resources.
- For Vercel AI Gateway setup:
  1. Install `ai` package.
  2. Pull environment variables locally via `vc env pull .env.local` to obtain `VERCEL_OIDC_TOKEN` (bypassing manual API key setup).
  3. Use `ai` SDK (`streamText`, `@ai-sdk/...`) configured with Vercel AI Gateway.
  4. Execute scripts referencing `.env.local` (e.g. `node --env-file=.env.local index.mjs`).

