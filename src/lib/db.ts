import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import { attachDatabasePool } from "@vercel/functions";
import { Pool, Client } from "pg";

let pool: Pool | null = null;

/**
 * Normalizes host path for Unix Domain Sockets vs TCP hostnames.
 */
function normalizeHost(rawHost: string): { host: string; isUnixSocket: boolean } {
  if (rawHost.startsWith("/")) {
    const cleanedHost = rawHost.replace(/\/\.?s\.PGSQL\.\d+$/, "");
    return { host: cleanedHost, isUnixSocket: true };
  }
  return { host: rawHost, isUnixSocket: false };
}

/**
 * Returns the initialized PostgreSQL connection pool.
 * Implements lazy loading and defensive checks to prevent crashing if environment variables are not yet populated.
 */
export function getDbPool(): Pool {
  if (pool) return pool;

  const rawHost = process.env.PGHOST || "database-2.cluster-ccxgoew4ygug.us-east-1.rds.amazonaws.com";
  const user = process.env.PGUSER || "postgres";
  const roleArn = process.env.AWS_ROLE_ARN;
  const region = process.env.AWS_REGION || "us-east-1";
  const port = Number(process.env.PGPORT) || 5432;
  const database = process.env.PGDATABASE || "postgres";

  const { host, isUnixSocket } = normalizeHost(rawHost);

  console.log(`[Database] Initializing connection pool to ${isUnixSocket ? 'Unix Socket ' + host : host + ':' + port}/${database} as user ${user}`);

  let passwordOption: any;

  if (roleArn && !isUnixSocket) {
    console.log(`[Database] Configuring AWS IAM OIDC Authentication using role: ${roleArn}`);
    const signer = new Signer({
      hostname: host,
      port: port,
      username: user,
      region: region,
      credentials: awsCredentialsProvider({
        roleArn: roleArn,
        clientConfig: { region: region },
      }),
    });
    passwordOption = () => signer.getAuthToken();
  } else {
    passwordOption = process.env.PGPASSWORD || process.env.SQL_PASSWORD || "";
  }

  const poolConfig: any = {
    host,
    user,
    database,
    password: passwordOption,
    port,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  if (isUnixSocket) {
    poolConfig.ssl = false;
  } else {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(poolConfig);

  pool.on("error", (err) => {
    console.error("[Database Pool Error]: Unexpected error on idle client:", err);
  });

  try {
    attachDatabasePool(pool);
    console.log("[Database] Attached connection pool to @vercel/functions handler.");
  } catch (err: any) {
    console.log(`[Database] Note: attachDatabasePool is not applicable in this runtime context: ${err.message}`);
  }

  return pool;
}

/**
 * Executes a PostgreSQL query.
 * If an explicit database authentication token (such as a 15-minute temporary AWS IAM sign-in token)
 * is passed, it connects via an isolated single-client instance to avoid polluting or leaking the main Pool.
 */
export async function queryWithToken(sql: string, params: any[] = [], token?: string): Promise<any> {
  const rawHost = process.env.PGHOST || "database-2.cluster-ccxgoew4ygug.us-east-1.rds.amazonaws.com";
  const user = process.env.PGUSER || "postgres";
  const port = Number(process.env.PGPORT) || 5432;
  const database = process.env.PGDATABASE || "postgres";

  const { host: normalizedHost, isUnixSocket } = normalizeHost(rawHost);

  if (token) {
    console.log(`[Database] Query executing via explicit token connection to ${isUnixSocket ? 'Unix Socket ' + normalizedHost : normalizedHost + ':' + port}/${database} as user ${user}`);
    const clientConfig: any = {
      host: normalizedHost,
      user,
      database,
      password: token,
      port,
    };

    if (isUnixSocket) {
      clientConfig.ssl = false;
    } else {
      clientConfig.ssl = { rejectUnauthorized: false };
    }

    const client = new Client(clientConfig);
    await client.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      await client.end().catch((err) => console.warn("[Database] Error closing explicit connection:", err));
    }
  }

  // Fallback to global pool
  const standardPool = getDbPool();
  return await standardPool.query(sql, params);
}

/**
 * Safe helper to check if database configuration is complete.
 */
export function isDbConfigured(): boolean {
  return !!(process.env.PGHOST && process.env.PGUSER);
}
