import { Signer } from '@aws-sdk/rds-signer';
import pg from 'pg';
const { Client } = pg;

async function main() {
  const hostname = 'dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com';
  const port = 5432;
  const username = 'postgres';
  const region = 'us-east-1';

  console.log(`Generating token for ${username} at ${hostname}:${port} in ${region}...`);

  const signer = new Signer({
    hostname,
    port,
    username,
    region
  });

  try {
    const password = await signer.getAuthToken();
    console.log('Token generated successfully.');

    const client = new Client({
      host: hostname,
      port: port,
      database: 'postgres',
      user: username,
      password,
      ssl: { rejectUnauthorized: false }
    });

    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');

    const res = await client.query('SELECT version()');
    console.log('Database version:', res.rows[0].version);

    await client.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
        // console.error(error.stack);
    }
  }
}

main();
