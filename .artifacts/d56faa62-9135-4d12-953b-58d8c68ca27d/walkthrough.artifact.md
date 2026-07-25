# Walkthrough: Vercel Connect (MCP) Integration

I have successfully integrated **Vercel Connect** into your project, enabling secure token generation and authorization for your Vercel-native Model Context Protocol (MCP) server.

## Changes Made

### 1. New Dependency: @vercel/connect
Installed the `@vercel/connect` library to handle the cryptographic handshake and token retrieval from Vercel's edge infrastructure.

### 2. Environment Configuration
Updated [.env.local](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env.local) with your MCP server ID:
`VERCEL_CONNECT_SERVER_ID="mcp.vercel.com/cheyoung1983-sudo-www-displaycellpros-com-refractored"`

### 3. API Route: Token Generation
Created [src/app/api/mcp/token/route.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/app/api/mcp/token/route.ts).
- **Endpoint:** `/api/mcp/token`
- **Security:** Requires an active Auth0 session.
- **Identity Mapping:** Automatically maps the Auth0 `sub` to the MCP `subject.id`.
- **Logic:** Calls `getToken` with the requested `openid`, `email`, and `profile` scopes.

### 4. API Route: Authorization Handshake
Created [src/app/api/mcp/authorize/route.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/app/api/mcp/authorize/route.ts).
- **Endpoint:** `/api/mcp/authorize`
- **Logic:** Calls `startAuthorization` to initiate the secure handshake between your user and the MCP provider.

## How to Verify

> [!NOTE]
> Ensure you are logged in to the application via Auth0 before testing these endpoints.

1.  **Get Token:**
    Navigate to `/api/mcp/token`. If authorized, it should return a JSON response containing your Vercel Connect token.
2.  **Start Authorization:**
    Navigate to `/api/mcp/authorize`. This should initiate the redirect flow to the MCP provider for initial user consent.

> [!IMPORTANT]
> **Production Readiness:** The routes are marked as `dynamic = 'force-dynamic'` to ensure they work correctly with your Vercel-native Postgres and Auth0 environment.
