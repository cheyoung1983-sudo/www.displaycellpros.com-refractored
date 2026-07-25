/**
 * Provider-Agnostic POS Service Interface
 * Designed to connect to custom POS systems (e.g. Lightspeed, Clover, Toast, custom API)
 */

export interface PosConfig {
  providerName: string;
  isConfigured: boolean;
  locationId: string;
  environment: string;
  apiVersion: string;
}

export function getPosConfig(): PosConfig {
  const provider = process.env.POS_PROVIDER || "Custom POS System";
  const apiKey = process.env.POS_API_KEY || process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.POS_LOCATION_ID || process.env.SQUARE_LOCATION_ID || "LOC_SPOKANE_MAIN_LAB";

  return {
    providerName: provider,
    isConfigured: !!apiKey,
    locationId,
    environment: process.env.POS_ENVIRONMENT || "production",
    apiVersion: "2026.1",
  };
}

export function isPosConfigured(): boolean {
  return getPosConfig().isConfigured;
}
