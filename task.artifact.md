# Task: Repository Cleanup & Vercel-Native Transition

- [x] Repository Integrity & Cleanup
    - [x] Update `.gitignore` to exclude build artifacts and IDE settings
    - [/] Remove tracked build artifacts from Git index (`.next/`, `.vercel/`, `.idea/`)
    - [ ] Soft reset and commit to flatten diverged history
- [ ] Vercel-Native Transition (Remove Google/Firebase)
    - [ ] Delete Firebase library files (`src/lib/firebase*`)
    - [ ] Remove Google Analytics and Site Verification from `src/app/layout.tsx`
    - [ ] Clean up Firebase/Google logic from `src/App.tsx`
    - [ ] Remove Firebase/Google dependencies from `package.json`
- [ ] Verification
    - [ ] Run `npm run lint`
    - [ ] Run `npm run build`
