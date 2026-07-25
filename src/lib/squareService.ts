import { Client, Environment } from "square";

let squareClientInstance: Client | null = null;

/**
 * Lazy initialization helper for Square SDK client.
 * Prevents server startup crashes when SQUARE_ACCESS_TOKEN is not yet set in environment.
 */
export function getSquareClient(): Client {
  if (!squareClientInstance) {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const environment =
      process.env.SQUARE_ENVIRONMENT?.toLowerCase() === "production"
        ? Environment.Production
        : Environment.Sandbox;

    if (!accessToken) {
      console.warn(
        "[Square SDK] SQUARE_ACCESS_TOKEN environment variable is missing. Operating in simulated fallback mode."
      );
    }

    squareClientInstance = new Client({
      accessToken: accessToken || "SANDBOX_MOCK_ACCESS_TOKEN",
      environment,
    });
  }

  return squareClientInstance;
}

/**
 * Checks if Square environment variables are properly configured.
 */
export function isSquareConfigured(): boolean {
  return !!(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_APPLICATION_ID && process.env.SQUARE_LOCATION_ID);
}

/**
 * Helper to get Square public credentials for frontend Web Payments SDK setup.
 */
export function getSquarePublicConfig() {
  return {
    applicationId: process.env.SQUARE_APPLICATION_ID || "sq0idp-demo-sandbox-id",
    locationId: process.env.SQUARE_LOCATION_ID || "L_DEMO_SPOKANE_LOCATION",
    environment: process.env.SQUARE_ENVIRONMENT || "sandbox",
    isConfigured: isSquareConfigured(),
  };
}
