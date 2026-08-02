import { Auth0Client } from '@auth0/nextjs-auth0/server';

/**
 * The Auth0 SDK client instance.
 * It automatically uses the AUTH0_* environment variables for configuration.
 * On Vercel, ensure AUTH0_BASE_URL is set to your deployment URL.
 */
export const auth0 = new Auth0Client({
  // Default configuration is usually sufficient when env vars are present.
  // Add custom options here if specific overrides are needed for the Vercel environment.
});
