# Implementation Plan - Enhanced Quote & Booking Process

Implement a stable and functional quote process following the "Profit Formula" business logic and integrate it with the official Google Calendar booking link.

## User Review Required

> [!IMPORTANT]
> The "Profit Formula" is identified as the logic currently in `server.ts` (`calculateQuoteInternal`), which uses parts cost + labor + overhead multipliers. If there is a different formula document I should follow, please let me know.

## Proposed Changes

### [Component Name] Backend (Server)

#### [MODIFY] [server.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/server.ts)
- Refactor `calculateQuoteInternal` to be more robust and strictly follow the "Profit Formula" components: `Raw Parts Cost + (Labor Hours * Hourly Rate) * Operational Overhead Multiplier`.
- Ensure the `/api/generate-quote` endpoint returns all necessary metadata for the booking transition.

### [Component Name] Frontend (React)

#### [MODIFY] [App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx)
- **Official Quote Integration**: Ensure the `Live Quote Summary` always reflects the backend calculation and handles loading/error states gracefully.
- **Booking Call-to-Action**:
    - Add a prominent "Finalize Quote & Book Appointment" button to the `Live Quote Summary` panel.
    - Add a similar button to the `AIAssistantWidget` once a quote is determined.
- **Booking Flow**:
    - When the booking button is clicked, summarize the quote details (e.g., "iPhone 14 Pro Max - Screen Repair - $355.32").
    - Provide a "Copy Quote Details" helper to make it easy for the user to paste into the Google Calendar "Notes" field.
    - Open the link: `https://calendar.app.google/f3Mc2kDhehzCBeBW9`.
- **Stability Improvements**:
    - Add validation to the ZIP code and device selection inputs to prevent calculation errors.
    - Synchronize the frontend "Local Simulation" logic with the backend "Profit Formula" to ensure consistency if the API is unreachable.

## Verification Plan

### Automated Tests
- I will verify the calculation logic by testing various combinations of `issueType` and `deviceTier` via the API.

### Manual Verification
- Verify that clicking "Book Appointment" correctly opens the Google Calendar link.
- Verify that the quote breakdown is accurate and matches the expected "Profit Formula" output.
- Test the ZIP code lookup and B2B discount application.
