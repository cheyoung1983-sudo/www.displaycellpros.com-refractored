# Task: Repository Cleanup & Vercel-Native Transition

- [x] Repository Integrity & Cleanup
    - [x] Update `.gitignore` to exclude build artifacts and IDE settings
    - [x] Remove tracked build artifacts from Git index (`.next/`, `.vercel/`, `.idea/`)
    - [/] Soft reset and commit to flatten diverged history
- [x] Vercel-Native Transition (Remove Google/Firebase)
    - [x] Delete Firebase library files (`src/lib/firebase*`)
    - [x] Remove Google Analytics and Site Verification from `src/app/layout.tsx`
    - [x] Clean up Firebase/Google logic from `src/App.tsx`
    - [x] Remove Firebase/Google dependencies from `package.json`
- [ ] Verification
    - [ ] Run `npm run lint`
    - [ ] Run `npm run build`
