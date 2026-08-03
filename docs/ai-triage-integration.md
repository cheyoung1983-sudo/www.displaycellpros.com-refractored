# AI Triage Integration Blueprint

## Overview
This blueprint documents the current Display & Cell Pros (D&CP) AI intake flow and the integration points for ElevenLabs, n8n, and website widget deployment.

The current app already includes a core D&CP system prompt in `src/app/api/triage/route.ts` and a floating widget in `src/components/AIAssistantWidget.tsx` that submits user input to `/api/triage`.

## Existing Repository Integration
- `src/app/api/triage/route.ts`: Defines the D&CP Virtual Intake Tech system prompt and sends user/chat history to OpenAI.
- `src/components/AIAssistantWidget.tsx`: Hosts the web chat widget and forwards user messages plus device details to the triage API.
- `src/components/LayoutWrapper.tsx`: Opens the AI widget and supplies default device specs.

## System Prompt for ElevenLabs
Copy/paste the following into ElevenLabs Agent Setup > System Prompt.

```text
YOU ARE "D&CP VIRTUAL INTAKE TECH", THE AUTOMATED INTAKE AND DIAGNOSTIC AGENT FOR DISPLAY & CELL PROS LLC (D&CP), SPOKANE'S PREMIER MOBILE ELECTRONICS REPAIR LABORATORY.

YOUR CORE DIRECTIVE IS TO ENGAGE WEBSITE VISITORS AND CALLERS, IDENTIFY THEIR EXACT DEVICE MODEL, CLASSIFY THEIR HARDWARE ISSUE INTO OUR THREE-TIER TECHNICAL DIAGNOSTIC MATRIX, PROVIDE AN ACCURATE QUOTE USING OUR PROFITABILITY FORMULA, AND DISPATCH A BOOKING LINK OR ESCALATE COMPLEX CASES TO HUMAN LEAD TECHNICIANS.

--- CORE OPERATIONAL GUIDELINES ---

1. BRAND & IDENTITY:
   - Always maintain "military-grade precision"—be concise, respectful, and authoritative.
   - Routinely reinforce our primary differentiator: "We bring the repair lab to you—no travel time, no leaving your device at a shop."
   - Identify D&CP as a combat-veteran-owned, Native-owned local business serving Spokane, Spokane Valley, and the Inland Northwest.

2. INTAKE FLOW & DEVICE QUALIFICATION:
   - STEP 1: Warm Welcome. Greet the customer and ask what device needs technical restoration today.
   - STEP 2: Exact Model Identification. Distinguish precisely between models (e.g., iPhone 14 Pro Max vs. standard iPhone 14, or Galaxy S24 Ultra vs. S24+).
   - STEP 3: Issue Categorization. Map the issue to Tier 1, Tier 2, or Tier 3.

3. THREE-TIER DIAGNOSTIC & PRICING LOGIC:
   - TIER 1 (Core Power & Port): Minor repairs (Battery replacement, charging port restoration). Fixed pricing range: $69 - $97.
   - TIER 2 (Display Renewal): High-velocity major repairs (Cracked OLED/LCD screens). Calculate quote using formula: Customer Price = Parts Cost + Labor ($50/hr) + 80% Profit/Overhead Margin.
     * Baseline Example: iPhone 12/13 Aftermarket Screen = $139.
     * Baseline Example: iPhone 14/15 Aftermarket Screen = $149 - $179.
     * Genuine OEM Options: $249 - $379 (Requires Apple/Samsung calibration disclosure).
   - TIER 3 (Specialized Micro-Soldering & Forensic Diagnostics): Motherboard shorts (VDD_MAIN / PP_VCC_MAIN), liquid damage, backlight coil/IC failure, data recovery, or no-power/dead-board issues.
     * PROCEDURE: DO NOT provide a binding quote. Inform the client that Tier 3 issues require surgical diagnostics under our lab's JBC micro-soldering stations and RF4 microscopy. Trigger the 'escalate_tier3_ticket' tool immediately for a manual callback from Ryan Young.

4. B2B & FLEET RECOGNITION:
   - Ask if the customer represents a commercial or corporate fleet partner (HVAC, Plumbing, Real Estate, Law Enforcement, ITAD).
   - If YES, apply a 15% B2B Preferred Discount to the labor component and highlight on-site data security compliance (data never leaves their parking lot).

5. WASHINGTON RIGHT TO REPAIR & PARTS QUALITY DISCLOSURES:
   - If asked about parts quality, state: "We operate in strict compliance with the Washington State Right to Repair Law (HB 1483). We use high-grade, factory-tested replacement components sourced from vetted wholesale distributors like MobileSentrix, fully backed by our D&CP warranty."
   - Disclose that serialized repairs (True Tone, Battery Health, Face ID) utilize JCID/i2C cryptographic programmers to ensure zero system popup warnings.

6. DATA PRIVACY & WAIVER MANDATE:
   - Inform all customers that before on-site repair, a digital liability waiver and NIST SP 800-88 R1 compliant data privacy acknowledgment must be signed via text/email link.

7. STRICT BOUNDARIES & ANTI-HALLUCINATION RULES:
   - If you do not have exact parts pricing for a niche model, invoke the 'get_repair_quote' tool.
   - Never promise zero-cost repairs or guarantee data recovery on physically destroyed NAND flash storage chips.
   - If a customer is abusive or requests illegal carrier/IMEI unlocking on stolen devices, state that D&CP strictly adheres to federal and state compliance laws and end the call.

OUTPUT RULES:
  - Return valid JSON containing 'text' and 'detectedSpecs'.
  - detectedSpecs must include brand, model, tier, issue, pricingTier, step, and if applicable 'action'.
  - If Tier 3 escalation is required, set action to 'escalate_tier3_ticket'.
```

## Custom Tool Definitions

### Tool 1: `get_repair_quote`
- Purpose: Fetch real-time wholesale parts cost and calculate customer price using D&CP's pricing formula.
- HTTP Method: POST
- Endpoint: `https://api.displaycellpros.com/v1/pricing/quote`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GetRepairQuoteInput",
  "type": "object",
  "properties": {
    "device_brand": {
      "type": "string",
      "enum": ["Apple", "Samsung", "Google", "Motorola", "Other"]
    },
    "device_model": {
      "type": "string",
      "description": "Exact device model, e.g., 'iPhone 14 Pro' or 'Galaxy S23 Ultra'"
    },
    "repair_type": {
      "type": "string",
      "enum": ["screen_aftermarket", "screen_oem", "battery", "charging_port", "camera", "back_glass"]
    },
    "is_b2b": {
      "type": "boolean",
      "default": false
    }
  },
  "required": ["device_brand", "device_model", "repair_type"]
}
```

Response schema:

```json
{
  "type": "object",
  "properties": {
    "tier": { "type": "string", "enum": ["Tier 1", "Tier 2", "Tier 3"] },
    "parts_cost": { "type": "number" },
    "labor_cost": { "type": "number" },
    "markup_overhead": { "type": "number" },
    "discount_applied": { "type": "number" },
    "subtotal": { "type": "number" },
    "wa_sales_tax_9_1": { "type": "number" },
    "total_out_the_door": { "type": "number" },
    "estimated_duration_minutes": { "type": "integer" }
  }
}
```

### Tool 2: `dispatch_booking_link`
- Purpose: Send an SMS with a customized booking link and waiver to the customer.
- HTTP Method: POST
- Endpoint: `https://api.displaycellpros.com/v1/intake/dispatch-sms`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DispatchBookingLinkInput",
  "type": "object",
  "properties": {
    "customer_name": { "type": "string" },
    "customer_phone": { "type": "string", "pattern": "^\\+1[0-9]{10}$" },
    "device_summary": { "type": "string" },
    "quoted_price": { "type": "number" },
    "service_tier": { "type": "string" },
    "location_address": { "type": "string", "description": "Spokane area service location" }
  },
  "required": ["customer_name", "customer_phone", "device_summary", "quoted_price"]
}
```

### Tool 3: `escalate_tier3_ticket`
- Purpose: Flag complex motherboard, micro-soldering, or liquid damage cases for manual review.
- HTTP Method: POST
- Endpoint: `https://api.displaycellpros.com/v1/intake/escalate-tier3`

Example payload:

```json
{
  "customer_name": "John Doe",
  "customer_phone": "+15095550199",
  "device_model": "iPhone XR",
  "failure_symptoms": "Shorted on VDD_MAIN, dead board, no boot, power supply drawing max current instantly",
  "intake_notes": "Client requested data recovery and board-level restoration. Pushed to Lead Tech dashboard."
}
```

## n8n Automation Workflow Blueprint

When the ElevenLabs agent triggers a tool call, n8n should orchestrate booking, estimate creation, inventory, and notification.

Recommended workflow nodes:

1. Webhook Trigger: receive payload from ElevenLabs.
2. QuickBooks Online customer upsert: create or match by phone number.
3. QuickBooks Online estimate creation: apply SKU-based service items.
4. Inventory reservation: mark MobileSentrix SKU as reserved.
5. Twilio SMS send: send personalized booking link.
6. Slack/SMS alert: notify Ryan Young on Tier 3 escalations.

### Wa state sales tax calculation snippet

```js
const basePrice = $json.body.subtotal;
const locationCode = $json.body.location_zip || "99208";
const waTaxRate = 0.091;

const taxAmount = Math.round((basePrice * waTaxRate) * 100) / 100;
const finalTotal = Math.round((basePrice + taxAmount) * 100) / 100;

return [{
  json: {
    subtotal: basePrice,
    taxAmount: taxAmount,
    finalTotal: finalTotal,
    locationCode: locationCode
  }
}];
```

### Twilio SMS target URL

```
https://displaycellpros.com/book?ticket={{ $json.qbo_estimate_id }}
```

## Website Widget Embed (Front-End)

Paste this snippet into the `index.html` or custom site template where the ElevenLabs widget should appear.

```html
<elevenlabs-convai agent-id="REPLACE_WITH_YOUR_ELEVENLABS_AGENT_ID"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>
```

## Implementation Notes

- The app currently uses an internal Next.js widget instead of a direct ElevenLabs script embed. The current path is `src/components/AIAssistantWidget.tsx`.
- The system prompt is already defined in `src/app/api/triage/route.ts`.
- To align with ElevenLabs tooling, the API can be extended later to accept direct tool call payloads.

## Deployment Instructions for Ryan Young

1. Copy the system prompt from this document into ElevenLabs Agent Setup > System Prompt.
2. Set the agent language to English and the model to `Eleven Flash v2.5`.
3. Create the custom tools in ElevenLabs using the JSON schemas above.
4. Update the website widget with the ElevenLabs embed snippet and replace `REPLACE_WITH_YOUR_ELEVENLABS_AGENT_ID`.
5. If using n8n, wire the tool payloads to the workflow defined above.

## Notes

- Washington retail sales tax is applied at 9.1% for Spokane-area diagnostic quotes.
- Tier 3 cases must never receive a fixed quote; they require manual escalation.
- B2B customers receive a 15% labor discount when identified.
