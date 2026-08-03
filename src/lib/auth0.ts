import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN ?? process.env.auth_AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID ?? process.env.auth_AUTH0_CLIENT_ID,
  clientSecret:
    process.env.AUTH0_CLIENT_SECRET ?? process.env.auth_AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET ?? process.env.auth_AUTH0_SECRET,
  appBaseUrl: process.env.APP_BASE_URL ?? process.env.APP_URL,
  enableAccessTokenEndpoint: false,
});
