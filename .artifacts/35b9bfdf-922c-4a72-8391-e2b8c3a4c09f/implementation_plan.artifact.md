# Implementation Plan - Spokane Market Dominance & Pricing Strategy

The goal is to transition the application to a **Value-Based Tiered Strategy** that monetizes the "Convenience Premium" of the mobile lab and integrates a "Data Privacy Guarantee" into the customer intake flow.

## User Review Required

> [!IMPORTANT]
> I am updating the core pricing logic to use the formula from the mission briefing: *Parts Cost + Labor ($50/hr) + 80% Overhead/Profit Margin*. This will result in three distinct tiers (Budget, Professional, Authorized) for every quote.

## Proposed Changes

### Backend Logic (`server.ts`)

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/server.ts)
- Update `calculateQuoteInternal` to return a `tiers` object (Budget, Professional, Authorized) instead of a single value.
- Implement "Bundle-to-Win" logic:
    - **Professional/Authorized**: Automatically include "Protective Shield" (tempered glass).
    - **Authorized**: Highlight "Genuine Parts" status.
- Add "Battery-Plus" upsell logic: return a discounted price for a battery repair when bundled.
- Update AI `systemInstruction` to include the **Data Privacy Guarantee**: "Highlight the on-site security advantage—device never leaves sight, no data exported."

### Frontend UI (`src/App.tsx`)

#### [MODIFY] [src/App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/src/App.tsx)
- Update the quote state and `fetchDynamicQuote` fallback to handle the new tiered response.
- **Redesign Quote UI**: Replace the single summary with a **Three-Tier Comparison Table**.
    - Highlight the **Professional Tier** as the recommended "Mission Sweet Spot".
    - Clearly list "Bundled Extras" (Tempered Glass, Lifetime Warranty) for the upper tiers.
- Add a "Add Battery Recovery (+50% Off)" toggle to the quote panel to demonstrate the upsell strategy.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure type safety with the new tiered quote structure.
- Run `npm run build` to verify production bundling.

### Manual Verification
- Trigger a quote in the UI and verify that all three tiers are displayed correctly.
- Toggle the "Battery Recovery" upsell and verify the total adjusts based on the 50% discount logic.
- Verify the AI Assistant mentions "On-site Data Privacy" during the intake flow.
