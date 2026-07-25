import { Auth0Client } from '@auth0/nextjs-auth0/server';

const secret = process.env.AUTH0_SECRET || 'ee45b83426eabf03b9c4521d53cbf79e551925c913f8199bb044ab24af2bda11';
const domain = process.env.AUTH0_DOMAIN || process.env.AUTH0_ISSUER_BASE_URL || 'icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com';
const clientId = process.env.AUTH0_CLIENT_ID || 'Lp7WTfhVU8M4E6Td4GjA2Ebp430AIrvm';
const clientSecret = process.env.AUTH0_CLIENT_SECRET || 'OWQ4GDum6UwImiecNPVIMVTptbcIanF0k2Cf7v3IQrw8VG7XQhNjYLnbeHjTLSbT';
const appBaseUrl = process.env.AUTH0_BASE_URL || process.env.APP_URL || 'http://localhost:3000';

export const auth0 = new Auth0Client({
  secret,
  domain,
  clientId,
  clientSecret,
  appBaseUrl,
});

