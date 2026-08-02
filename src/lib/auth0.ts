import { Auth0Client } from '@auth0/nextjs-auth0/server';

/**
 * The Auth0 SDK client instance.
 * It automatically uses the AUTH0_* environment variables for configuration.
 * On Vercel, ensure AUTH0_BASE_URL is set to your deployment URL.
 */
export const auth0 = new Auth0Client({
  // Explicitly passing environment variables to ensure compatibility
  // in all runtime environments (Edge, Server, etc.)
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});
