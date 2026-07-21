# Implementation Plan - Fix README.md Warnings and Errors

The goal is to fix various formatting issues, outdated instructions, and potential linter warnings in the `README.md` file.

## User Review Required

> [!IMPORTANT]
> I am updating the `GEMINI_API_KEY` instruction to `OPENAI_API_KEY` because the project's backend (`server.ts` and `api/triage.ts`) primarily uses the OpenAI SDK. If the project is intended to use both, please let me know.

## Proposed Changes

### Documentation

#### [MODIFY] [README.md](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/www.displaycellpros.com-refractored/README.md)
- Update `GEMINI_API_KEY` to `OPENAI_API_KEY` to match the codebase and `.env.example`.
- Replace inline code blocks for multi-line instructions with fenced code blocks (```bash) for better readability and linter compatibility.
- Standardize indentation and spacing (fix double spaces and list alignment).
- Improve the `alt` text for the banner image from "GHBanner" to something more descriptive like "Display & Cell Pros Banner".
- Ensure a single newline at the end of the file.

## Verification Plan

### Manual Verification
- Review the rendered `README.md` to ensure formatting is correct.
- Verify that the instructions now correctly point to `OPENAI_API_KEY` which is required by `server.ts`.
