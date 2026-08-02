import { Auth0Client } from '@auth0/nextjs-auth0/server';

/**
 * The Auth0 SDK client instance.
 * It automatically uses the AUTH0_* environment variables for configuration.
 * On Vercel, ensure AUTH0_BASE_URL is set to your deployment URL.
 */
export const auth0 = new Auth0Client({
  secret: process.env.AUTH0_SECRET || 'fallback-secret-for-build-time-only',
  appBaseUrl: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
  domain: (process.env.AUTH0_ISSUER_BASE_URL || 'example.auth0.com').replace('https://', '').replace(/\/$/, ''),
  clientId: process.env.AUTH0_CLIENT_ID || 'fallback-client-id',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || 'fallback-client-secret',
});
