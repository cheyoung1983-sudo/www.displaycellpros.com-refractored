import { Signer } from '@aws-sdk/rds-signer';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { Client } = pg;

async function testConnection() {
  const hostname = process.env.PGHOST || 'dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com';
  const port = Number(process.env.PGPORT) || 5432;
  const username = process.env.PGUSER || 'postgres';
  const region = process.env.AWS_REGION || 'us-east-1';
  const database = process.env.PGDATABASE || 'postgres';

  console.log('--- RDS Connection Test ---');
  console.log(`Target: ${hostname}:${port}`);
  console.log(`User: ${username}`);
  console.log(`Region: ${region}`);
  console.log(`Database: ${database}`);

  try {
    console.log('\nStep 1: Generating RDS IAM Authentication Token...');
    const signer = new Signer({
      hostname,
      port,
      username,
      region,
    });

    const token = await signer.getAuthToken();
    console.log('✓ Token generated successfully.');

    console.log('\nStep 2: Connecting to PostgreSQL...');
    const client = new Client({
      host: hostname,
      port: port,
      database: database,
      user: username,
      password: token,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await client.connect();
    console.log('✓ Connected successfully!');

    const res = await client.query('SELECT version(), current_database(), current_user');
    console.log('\nDatabase Info:');
    console.table(res.rows[0]);

    await client.end();
    console.log('\nConnection closed clean.');
  } catch (error: any) {
    console.error('\n❌ Connection Failed:');
    console.error(error.message);

    if (error.message.includes('Could not load credentials')) {
      console.log('\nTIP: Make sure you have AWS credentials set up.');
      console.log('Try running: aws sts get-caller-identity');
    }
  }
}

testConnection();
