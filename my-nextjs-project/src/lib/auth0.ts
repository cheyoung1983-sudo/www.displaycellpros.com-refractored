import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Forensic Audit: Ensure all required environment variables are present
const requiredVars = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_SECRET',
  'APP_BASE_URL'
];

requiredVars.forEach((v) => {
  if (!process.env[v] || process.env[v]?.includes('REPLACE_WITH')) {
    console.warn(`[S2C AUTH WARNING]: Environment variable ${v} is missing or contains a placeholder.`);
  }
});

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN || '',
  clientId: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  secret: process.env.AUTH0_SECRET || '',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
});
