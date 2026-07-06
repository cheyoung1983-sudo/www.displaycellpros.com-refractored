# Firebase Deployment & Development Best Practices

This document outlines the best practices implemented for the Display Cell Pros Triage-AI platform's Firebase infrastructure.

## 1. Automated CI/CD Deployment
A GitHub Action has been configured in `.github/workflows/firebase-deploy.yml`. 
- **Trigger**: Every push to the `main` branch.
- **Action**: Runs a production build and deploys to Firebase Hosting and Firestore.
- **Requirement**: You must add `FIREBASE_TOKEN` or `FIREBASE_SERVICE_ACCOUNT_DISPLAYCELLPROS_COM` to your GitHub Repository Secrets.

## 2. Environment Separation
The project uses `.env` files (via Vite) to handle configuration.
- **Best Practice**: Use `VITE_FIREBASE_*` environment variables instead of hardcoding the config in JSON files. This allows the same build to be deployed to Staging or Production by simply swapping the environment context.
- **Status**: Currently, the project still references `firebase-applet-config.json`. It is recommended to migrate this to `import.meta.env` in `src/lib/firebase.ts`.

## 3. Local Development with Emulators
Firebase Emulators allow you to test Auth, Firestore, and Hosting locally without touching production data.
- **Command**: `npm run emulators`
- **UI**: Accessible at `http://localhost:4000`
- **Benefits**: Faster development cycles, offline support, and safer testing of Security Rules.

## 4. Hosting & Forensic Security Optimizations
The `firebase.json` has been hardened with enterprise-grade configurations:
- **Security Headers**: Implemented `Content-Security-Policy`, `Strict-Transport-Security`, and `X-Frame-Options` to prevent XSS and clickjacking.
- **Cache Control**: Immutable long-term caching for `/assets/**` to optimize the "Forensic Gateway" load times.
- **Service Account Integration**: The project uses a dedicated `forensic-deployer` service account in `cloudbuild.yaml` for Principle of Least Privilege.

## 5. Firestore Security Rules (CoV Framework)
Rules in `firestore.rules` follow the Chain-of-Verification (CoV) model:
- **Identity Isolation**: Users can only access their own forensic tickets.
- **Role-Based Access**: `forensic_investigator` role is required for global audit viewing.
- **Lead Protection**: Public write access is limited to the `leads` collection, with investigator-only read access.
- **NIST Compliance**: Strict "Explicit Deny" catch-all for unauthorized paths.

## 6. Recommended Next Steps
- **Storage Rules**: Create a `storage.rules` file to protect any uploaded binary data (e.g., diagnostic photos).
- **Backups**: Enable "Cloud Firestore Managed Backups" in the Google Cloud Console.
- **Monitoring**: Set up "Firebase Performance Monitoring" to track load times and network latency in production.
