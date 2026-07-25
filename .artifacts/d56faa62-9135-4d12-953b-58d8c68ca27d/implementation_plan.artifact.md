# Implementation Plan: Integrate Vercel Connect (MCP)

The goal is to enable secure token generation and authorization for the Vercel-native Model Context Protocol (MCP) server using the `@vercel/connect` library. This allows the project to participate in the MCP ecosystem as an authenticated agent or tool.

## User Review Required

> [!IMPORTANT]
> **New Dependency:** Adding `@vercel/connect` to `package.json`.
>
> **Identity Mapping:** The MCP token and authorization will be scoped to the currently authenticated Auth0 user. We will map the Auth0 `sub` (User ID) to the MCP `subject.id`.

## Open Questions

> [!WARNING]
> **MCP Server URL:** The user provided `mcp.vercel.com/cheyoung1983-sudo-www-displaycellpros-com-refractored`. I will use this as the default server ID.

## Proposed Changes

### [Vercel Connect Integration]

#### [MODIFY] [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/package.json)
- Add `@vercel/connect` to the `dependencies` list.

#### [NEW] [route.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/app/api/mcp/token/route.ts)
- Create a new API route to generate tokens.
- **Logic:**
  1. Authenticate the request using `auth0.getSession()`.
  2. If authenticated, call `getToken` from `@vercel/connect`.
  3. Return the generated token to the client.

#### [NEW] [route.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/app/api/mcp/authorize/route.ts)
- Create a new API route to initiate authorization.
- **Logic:**
  1. Authenticate the request using `auth0.getSession()`.
  2. Call `startAuthorization` from `@vercel/connect`.
  3. Handle the redirect or return the authorization URL.

#### [MODIFY] [.env.local](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env.local)
- Add `VERCEL_CONNECT_SERVER_ID="mcp.vercel.com/cheyoung1983-sudo-www-displaycellpros-com-refractored"`

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the new dependency doesn't break the build.
- Create a test script `scripts/test-mcp-token.ts` to mock a session and verify token generation logic.

### Manual Verification
- Log in to the application.
- Navigate to `/api/mcp/token` and verify a token is returned.
- Navigate to `/api/mcp/authorize` and verify the authorization flow starts.
