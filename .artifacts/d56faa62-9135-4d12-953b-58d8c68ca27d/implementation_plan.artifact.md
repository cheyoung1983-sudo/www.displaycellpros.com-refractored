# Implementation Plan: Fix Vercel Build - Command Not Found (Exit 127)

The goal is to resolve the Vercel build error `Command "npm run build" exited with 127`. This error typically indicates that a command within the build script (like `next` or `tsx`) cannot be located by the shell.

## User Review Required

> [!IMPORTANT]
> **Lockfile Conflict:** I am removing `bun.lock` to ensure Vercel uses `npm` as the primary package manager. Having multiple lockfiles (`package-lock.json` and `bun.lock`) can cause Vercel to use the wrong runtime or fail to install dependencies correctly.
>
> **Explicit Framework:** I am adding the `framework` property to `vercel.json` to explicitly tell Vercel this is a Next.js project.

## Proposed Changes

### [Repository Cleanup]

#### [DELETE] [bun.lock](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/bun.lock)
- Remove the Bun lockfile to avoid package manager confusion. We are using `npm` and `package-lock.json`.

### [Configuration]

#### [MODIFY] [vercel.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/vercel.json)
- Add `"framework": "nextjs"` to the configuration.

#### [MODIFY] [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/package.json)
- Ensure all build dependencies are in the `dependencies` block if they are needed for the `postbuild` step (e.g., `tsx`).
- Move `tsx` from `devDependencies` to `dependencies` to guarantee its availability during the Vercel build lifecycle.

## Verification Plan

### Automated Tests
- Run `npm run build` locally to ensure the full build and `postbuild` (sitemap) flow works without error.

### Manual Verification
- Deploy to Vercel and monitor the logs. The `127` error should be resolved as the correct package manager (`npm`) is used and all commands are available in the path.
