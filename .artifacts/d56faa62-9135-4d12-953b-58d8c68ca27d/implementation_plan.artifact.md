# Implementation Plan: Repository Cleanup & Vercel-Native Transition

The goal is to fix the GitHub repository by cleaning up the commit history, removing untracked build artifacts, and fully transitioning the project to a Vercel-native architecture (Auth0 + Next.js + Vercel Postgres) while removing all Google/Firebase dependencies as requested.

## User Review Required

> [!CAUTION]
> **Repository Sync Strategy:** The local and remote branches have diverged significantly (by over 240 commits, mostly build artifacts). I propose using a `reset --soft` strategy to flatten the local changes into a single clean commit on top of the remote history. This will "fix" the repository history while preserving all your current work.
>
> **Firebase Removal:** I will be deleting all Firebase and Google-specific code (Auth, Firestore, Analytics). Please ensure you have backed up any data from the Firebase console if needed.

## Proposed Changes

### [Repository Integrity]

#### [MODIFY] [.gitignore](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.gitignore)
- Add `.next/`, `.idea/`, `.vercel/`, `out/`, and `dist/` to ensure build artifacts and IDE settings are never tracked again.

#### [ACTION] Git Index Cleanup
- Stop tracking `.next/`, `.idea/`, and `.vercel/` folders that are currently in the Git index.
- Flatten the diverged history into a single clean "Next.js + Auth0 Migration" commit.

### [Vercel-Native Transition]

#### [DELETE] Firebase Files
- Remove `src/lib/firebase.ts`, `src/lib/firebase-admin.ts`, and `src/lib/firebase-errors.ts`.

#### [MODIFY] [layout.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/app/layout.tsx)
- Remove Google Analytics (`gtag.js`) scripts.
- Remove the `google-site-verification` meta tag.

#### [MODIFY] [App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx)
- Remove all Firebase imports (`firebase/auth`, `firebase/firestore`).
- Remove `FirebaseUserAuditor` and `FirebaseAiWorkbenchView` logic.
- Replace Firebase Auth state management with Auth0 (where applicable, though the new `page.tsx` already handles this).

#### [MODIFY] [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/package.json)
- Remove `firebase` and `firebase-admin` dependencies.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no broken references remain after removing Firebase.
- Run `npm run build` locally to verify the Next.js build succeeds without errors.

### Manual Verification
- Verify that the new Auth0 login screen loads correctly.
- Ensure no "Google" or "Firebase" related logs appear in the browser console.
