import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import { db as vercelDb } from "@vercel/postgres";
import { Pool, Client } from "pg";

let pool: Pool | null = null;

/**
 * Returns the initialized PostgreSQL connection pool.
 * prioritizes Vercel Postgres (Neon) if configured, otherwise falls back to AWS RDS.
 */
export function getDbPool(): any {
  // 1. Check for Vercel Postgres (Managed Neon)
  if (process.env.POSTGRES_URL) {
    return vercelDb;
  }

  // 2. Fallback to AWS RDS with IAM OIDC
  if (pool) return pool;

  const host = process.env.PGHOST;
  const user = process.env.PGUSER;
  const roleArn = process.env.AWS_ROLE_ARN;
  const region = process.env.AWS_REGION || "us-east-1";
  const port = Number(process.env.PGPORT) || 5432;
  const database = process.env.PGDATABASE || "postgres";

  if (!host || !user) {
    throw new Error("Database configuration variables are missing.");
  }

  console.log(`[Database] Initializing AWS RDS pool to ${host}`);

  let passwordOption: any;

  // Use IAM authentication if Role ARN is provided or if explicit IAM flag is set
  const useIAM = roleArn || process.env.USE_RDS_IAM === "true";

  if (useIAM) {
    const signerConfig: any = {
      hostname: host,
      port: port,
      username: user,
      region: region,
    };

    if (roleArn) {
      signerConfig.credentials = awsCredentialsProvider({
        roleArn: roleArn,
        clientConfig: { region: region },
      });
    }

    const signer = new Signer(signerConfig);
    passwordOption = () => signer.getAuthToken();
    console.log(`[Database] Using RDS IAM authentication`);
  } else {
    passwordOption = process.env.PGPASSWORD || "";
    console.log(`[Database] Using standard password authentication`);
  }

  pool = new Pool({
    host,
    user,
    database,
    password: passwordOption,
    port,
    ssl: { rejectUnauthorized: false },
  });

  return pool;
}

/**
 * Executes a PostgreSQL query using the best available client.
 */
export async function queryWithToken(sql: string, params: any[] = []): Promise<any> {
  const db = getDbPool();

  // If using Vercel Postgres (Neon)
  if (process.env.POSTGRES_URL) {
    return await db.query(sql, params);
  }

  // Fallback to AWS RDS pool
  return await db.query(sql, params);
}

/**
 * Safe helper to check if database configuration is complete.
 */
export function isDbConfigured(): boolean {
  return !!(process.env.POSTGRES_URL || (process.env.PGHOST && process.env.PGUSER));
}
