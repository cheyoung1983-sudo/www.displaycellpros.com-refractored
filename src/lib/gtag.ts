/**
 * Google Ads & Analytics Conversion Tracking Helper
 * Optimized for Google Ads Smart Campaigns and Google Business Profile tracking.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-11520847291";

/**
 * Initializes Google Tag Manager / Gtag snippet dynamically if not present.
 */
export function initGoogleTag() {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_ADS_ID, {
      send_page_view: true,
      cookie_flags: "max-age=7200;secure;samesite=none",
    });

    // Dynamically insert gtag.js script tag
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    document.head.appendChild(script);
  }
}

/**
 * Fires standard Google Ads Conversion & Event reports.
 */
export function trackGoogleAdsConversion(
  eventName: "appointment_scheduled" | "inquiry_submitted" | "quote_requested" | "signup_completed" | "contact_requested",
  params: {
    conversionId?: string;
    value?: number;
    currency?: string;
    transaction_id?: string;
    device_info?: string;
  } = {}
) {
  if (typeof window === "undefined") return;

  initGoogleTag();

  const payload = {
    send_to: GOOGLE_ADS_ID,
    value: params.value || 1.0,
    currency: params.currency || "USD",
    transaction_id: params.transaction_id || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    event_category: "Google Ads Smart Campaign",
    event_label: eventName,
    ...params,
  };

  if (window.gtag) {
    window.gtag("event", eventName, payload);
    window.gtag("event", "conversion", payload);
  }

  console.log(`[Google Ads Tracking] Conversion event recorded: ${eventName}`, payload);
}
