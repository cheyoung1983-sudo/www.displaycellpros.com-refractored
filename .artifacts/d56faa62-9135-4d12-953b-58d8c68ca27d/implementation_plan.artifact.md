# Implementation Plan: Repair Vercel/Autonoma Integration & Consolidate Projects

The goal is to fix the "sh: 1: vite: command not found" error, complete the project consolidation on Vercel, and ensure the Autonoma MCP plugin is correctly paired.

## User Review Required

> [!CAUTION]
> **Zero-Interaction Execution:** Since you cannot access the terminal to confirm prompts, I will use the `--yes` flag for all Vercel and Git operations.
>
> **Project Deletion:** I am proceeding to delete the redundant projects to leave only `displaycellpros.com`.

## Proposed Changes

### [Vercel Deployment Repair]

#### [MODIFY] [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/package.json)
- **Fix:** Ensure the `build` script uses `next build` instead of `vite build`. (Already applied in source, but ensuring it's synced).

#### [ACTION] Sync Environment Variables
- I will push all 18+ local environment variables (AWS, Auth0, Autonoma) to the `displaycellpros.com` project using `vercel env add --yes`.

### [Autonoma MCP Repair]

#### [ACTION] Re-pair Plugin
- I will re-run the `mcp-remote` onboarding with code `VNTPA9VD` using the `--yes` or equivalent non-interactive strategy if available.
- I will update the IDE configuration files.

### [Vercel Cleanup]

#### [DELETE] Redundant Projects
- `vercel project rm www.displaycellpros.com-refractored --yes`
- `vercel project rm cheyoung1983-sudo-www.displaycellpros.com-refractored --yes`

## Verification Plan

### Manual Verification
- **Build Status:** Run `vercel deploy --prod --yes` and verify the build log shows a successful Next.js compilation.
- **MCP Status:** Check if the `autonoma` tool is active in your agent.
