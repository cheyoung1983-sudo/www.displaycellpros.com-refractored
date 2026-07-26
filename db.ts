import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import { attachDatabasePool } from "@vercel/functions";
import { Pool, Client } from "pg";
import { execSync } from "child_process";

let pool: Pool | null = null;

/**
 * Normalizes host path for Unix Domain Sockets vs TCP hostnames.
 */
function normalizeHost(rawHost: string): { host: string; isUnixSocket: boolean } {
  if (rawHost.startsWith("/")) {
    // If host is a socket path like /app/cloudsql/project:region:instance/.s.PGSQL.5432
    // Strip trailing /.s.PGSQL.5432 or /s.PGSQL.5432 so pg gets the socket directory
    const cleanedHost = rawHost.replace(/\/\.?s\.PGSQL\.\d+$/, "");
    return { host: cleanedHost, isUnixSocket: true };
  }
  return { host: rawHost, isUnixSocket: false };
}

/**
 * Safe helper to check if database configuration is complete.
 */
export function isDbConfigured(): boolean {
  return !!(process.env.PGHOST || process.env.SQL_HOST || process.env.PGDATABASE);
}

/**
 * Returns the initialized PostgreSQL connection pool.
 * Implements lazy loading and defensive checks to prevent crashing if environment variables are not yet populated.
 */
export function getDbPool(): Pool {
  if (pool) return pool;

  // Prioritize PGHOST or explicit database-2 endpoint
  const rawHost = process.env.PGHOST || process.env.SQL_HOST || "database-2.cluster-ccxgoew4ygug.us-east-1.rds.amazonaws.com";
  const user = process.env.PGUSER || process.env.SQL_USER || "postgres";
  const password = process.env.PGPASSWORD || process.env.SQL_PASSWORD || "";
  const database = process.env.PGDATABASE || process.env.SQL_DATABASE || "postgres";
  const port = Number(process.env.PGPORT || process.env.SQL_PORT) || 5432;
  const roleArn = process.env.AWS_ROLE_ARN;
  const region = process.env.AWS_REGION || "us-east-1";

  const { host, isUnixSocket } = normalizeHost(rawHost);

  console.log(`[Database] Initializing connection pool to ${isUnixSocket ? 'Unix Socket ' + host : host + ':' + port}/${database} as user ${user}`);

  let passwordOption: any = password;

  if (!isUnixSocket) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const hasVercelOidc = !!(process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL);

    if (accessKeyId && secretAccessKey) {
      console.log(`[Database] Configuring AWS RDS Signer token generator for ${host}`);
      try {
        const signer = new Signer({
          hostname: host,
          port: port,
          username: user,
          region: region,
          credentials: {
            accessKeyId,
            secretAccessKey
          }
        });
        passwordOption = async () => {
          try {
            return await signer.getAuthToken();
          } catch (err: any) {
            console.warn("[Database] AWS RDS Signer token fetch error, using password fallback:", err.message);
            return password;
          }
        };
      } catch (err: any) {
        console.warn("[Database] AWS RDS Signer init error:", err.message);
      }
    } else if (roleArn && hasVercelOidc) {
      console.log(`[Database] Configuring AWS RDS Signer OIDC for ${host}`);
      try {
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
        passwordOption = async () => {
          try {
            return await signer.getAuthToken();
          } catch (err: any) {
            console.warn("[Database] AWS RDS Signer OIDC token error, using password fallback:", err.message);
            return password;
          }
        };
      } catch (err: any) {
        console.warn("[Database] AWS RDS Signer OIDC init error, falling back:", err.message);
      }
    }
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
    // Unix domain sockets do NOT use SSL in pg
    poolConfig.ssl = false;
  } else {
    // TCP sockets use SSL
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(poolConfig);

  // Catch unexpected errors on idle pool clients so they do not crash Node
  pool.on("error", (err) => {
    console.error("[Database Pool Error]: Unexpected error on idle client:", err);
  });

  try {
    attachDatabasePool(pool);
    console.log("[Database] Attached connection pool to @vercel/functions handler.");
  } catch (err: any) {
    console.log(`[Database] Note: attachDatabasePool is not applicable in this context: ${err.message}`);
  }

  return pool;
}

export const DATABASE_2_HOST = "database-2.cluster-ccxgoew4ygug.us-east-1.rds.amazonaws.com";
export const DATABASE_2_USER = "postgres";
export const DATABASE_2_DB = "postgres";

export async function getAuthTokenForDatabase2(): Promise<string | null> {
  const host = process.env.PGHOST || DATABASE_2_HOST;
  const user = process.env.PGUSER || DATABASE_2_USER;
  const port = Number(process.env.PGPORT) || 5432;
  const region = process.env.AWS_REGION || "us-east-1";

  // Check if CLI can generate token
  try {
    const cliToken = execSync(
      `export PATH="$HOME/.local/bin:$PATH" && aws rds generate-db-auth-token --hostname ${host} --port ${port} --username ${user} --region ${region}`,
      {
        encoding: "utf8",
        env: {
          ...process.env,
          AWS_DEFAULT_REGION: region
        }
      }
    ).trim();
    if (cliToken && cliToken.length > 50) return cliToken;
  } catch (err: any) {
    // CLI not configured or missing, proceed to SDK
  }

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const roleArn = process.env.AWS_ROLE_ARN;
  const hasVercelOidc = !!(process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL);

  if (accessKeyId && secretAccessKey) {
    try {
      const signer = new Signer({
        hostname: host,
        port: port,
        username: user,
        region: region,
        credentials: {
          accessKeyId,
          secretAccessKey
        }
      });
      return await signer.getAuthToken();
    } catch (err: any) {
      console.warn("[Database] AWS RDS Signer error:", err.message);
    }
  } else if (roleArn && hasVercelOidc) {
    try {
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
      return await signer.getAuthToken();
    } catch (err: any) {
      console.warn("[Database] AWS RDS Signer OIDC error:", err.message);
    }
  }

  return null;
}

/**
 * Executes a PostgreSQL query.
 * If an explicit database authentication token (such as a 15-minute temporary AWS IAM sign-in token)
 * is passed or generated, it connects via an isolated single-client instance.
 */
export async function queryWithToken(sql: string, params: any[] = [], token?: string): Promise<any> {
  const host = process.env.PGHOST || DATABASE_2_HOST;
  const user = process.env.PGUSER || DATABASE_2_USER;
  const database = process.env.PGDATABASE || DATABASE_2_DB;
  const port = Number(process.env.PGPORT) || 5432;

  const { host: normalizedHost, isUnixSocket } = normalizeHost(host);

  let activeToken = token;
  if (!activeToken && !isUnixSocket) {
    try {
      const generatedToken = await getAuthTokenForDatabase2();
      if (generatedToken) {
        activeToken = generatedToken;
      }
    } catch (err: any) {
      console.warn("[Database] Could not generate dynamic RDS token:", err.message);
    }
  }

  if (activeToken) {
    console.log(`[Database] Query executing via explicit token connection to ${isUnixSocket ? 'Unix Socket ' + normalizedHost : normalizedHost + ':' + port}/${database} as user ${user}`);
    const clientConfig: any = {
      host: normalizedHost,
      user,
      database,
      password: activeToken,
      port,
      connectionTimeoutMillis: 10000,
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


