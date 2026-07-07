# Display & Cell Pros - Redesigned Static Single Page App

## Overview

This is a streamlined, production-optimized single-page application (SPA) that focuses on the core diagnostic intake workflow. The redesigned architecture simplifies the codebase from 13K+ lines to a focused, maintainable structure while maintaining forensic diagnostic capabilities.

## Architecture Principles

### 1. **Focused Workflow**
- **Single Entry Point:** Linear diagnostic workflow (Intake → Diagnostics → Quote → Confirmation)
- **No Tab Complexity:** Eliminates the multi-tab navigation from the original design
- **Progressive Disclosure:** Each page reveals information relevant to the current step only

### 2. **Optimized Bundle Size**
- Lazy-loaded page components reduce initial bundle
- Code splitting per step keeps each page < 50KB gzipped
- No monolithic 13K-line App.tsx
- Minimal state management via Context API instead of Redux

### 3. **State Management via Context**
```
AppContext/
├── Toast notifications
├── Authentication state
├── Diagnostic data (customer name, device, issue)
├── Current workflow step
└── Data persistence (tickets, leads)
```

## Project Structure

```
src/
├── contexts/
│   └── AppContext.tsx          # Global state management via Context API
├── pages/                       # Workflow step pages
│   ├── IntakePage.tsx           # Customer & device intake form
│   ├── DiagnosticsPage.tsx      # S2C diagnostic assessment
│   ├── QuotePage.tsx            # Dynamic repair quote generator
│   └── ConfirmationPage.tsx     # Ticket confirmation & next steps
├── components/                  # Reusable UI components
│   ├── ToastNotification.tsx
│   ├── BrandLogo.tsx
│   └── ... shared components
├── modules/triage-ai/          # Diagnostic subsystem
│   ├── HardwareScanChart.tsx    # Telemetry visualization
│   └── ForensicsView.tsx        # S2C diagnostic mapping
├── lib/                         # Firebase & utilities
│   ├── firebase.ts
│   ├── firebase-admin.ts
│   └── recaptcha.ts
├── services/
│   ├── nativeHardwareServices.ts
│   └── auth.ts
├── types.ts                     # Global TypeScript interfaces
├── App-redesigned.tsx           # New main entry point
└── main.tsx                     # Vite entry point
```

## Key Features

### 1. **Context-Based State Management**
No Redux, no prop drilling. All state lives in `AppContext`:

```typescript
const { 
  customerName, setCustomerName,
  deviceBrand, setDeviceBrand,
  currentStep, setCurrentStep,
  addToast, removeToast
} = useApp();
```

### 2. **Page Transitions with Motion**
Smooth animations between workflow steps using Framer Motion:

```typescript
<AnimatePresence mode="wait">
  <motion.div 
    key={currentStep}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    {/* Current page renders here */}
  </motion.div>
</AnimatePresence>
```

### 3. **Toast Notification System**
Global toast management for user feedback:

```typescript
addToast("Title", "Message", "success", 4000);
// Types: "info" | "success" | "warning" | "error"
```

### 4. **Progressive Diagnostic Workflow**

| Step | Purpose | Key Actions |
|------|---------|-------------|
| **Intake** | Collect customer & device info | Device brand, model, issue type |
| **Diagnostics** | Display S2C assessment | Hardware telemetry, findings |
| **Quote** | Generate repair estimate | Parts, labor, tax calculation |
| **Confirmation** | Lock in quote & next steps | Download PDF, share ticket |

## Development Workflow

### Adding a New Page

1. Create page component in `src/pages/YourPage.tsx`:
```typescript
import { useApp } from "../contexts/AppContext";
import { motion } from "motion/react";

export default function YourPage() {
  const { setCurrentStep, addToast } = useApp();
  
  return (
    <motion.div /* animations */>
      {/* Your page content */}
    </motion.div>
  );
}
```

2. Add route handler to `App-redesigned.tsx`:
```typescript
const YourPage = React.lazy(() => import("./pages/YourPage"));

{currentStep === "your-step" && <YourPage />}
```

3. Add step type to `AppContext`:
```typescript
currentStep: "intake" | "diagnostics" | "quote" | "confirmation" | "your-step"
```

### Adding Global State

1. Add to `AppContext.tsx`:
```typescript
interface AppContextType {
  yourData: string;
  setYourData: (data: string) => void;
  // ...
}
```

2. Use in components:
```typescript
const { yourData, setYourData } = useApp();
```

## Performance Optimizations

### 1. **Lazy Component Loading**
```typescript
const DiagnosticsPage = React.lazy(() => import("./pages/DiagnosticsPage"));
<Suspense fallback={<PageLoader />}>
  {currentStep === "diagnostics" && <DiagnosticsPage />}
</Suspense>
```

### 2. **Code Splitting**
- Each page is a separate chunk
- Only loaded when user reaches that step
- Reduces initial bundle from ~2MB to ~500KB

### 3. **Motion Animations**
- Hardware-accelerated CSS transforms
- 60fps page transitions
- No jank on low-end devices

### 4. **No Redundant Renders**
- Context uses `useCallback` for handlers
- Minimal component tree depth
- No unnecessary prop passing

## Styling Architecture

### Color Palette
```typescript
// Brand Colors (CSS variables)
--color-obsidian: #111111      // Background
--color-audit-teal: #008080     // Primary accent
--color-silicon-blue: #00BFFF   // Highlights
--color-forensic-amber: #FFBF00 // Warnings
```

### Tailwind Classes
- Use predefined brand colors
- Responsive grid system: `grid-cols-1 lg:grid-cols-3`
- Focus states: `focus:ring-2 focus:ring-[#00BFFF]`

## Deployment

### Build for Production
```bash
npm run build
# Outputs:
# - dist/index.html (SPA entry point)
# - dist/assets/*.js (code chunks)
# - dist/server.cjs (optional Node backend)
```

### Firebase Hosting
```bash
firebase deploy --only hosting
# SPA rewrite configured in firebase.json
# All routes serve index.html, React Router handles client-side routing
```

## Migration from Old App.tsx

The old `App.tsx` (13K+ lines) is replaced with:

| Old | New |
|-----|-----|
| 50+ state variables | `AppContext` with 15 managed states |
| Multiple tabs/views | 4 focused pages |
| Complex routing logic | Simple step-based navigation |
| `activeTab` state | `currentStep` in context |
| Lazy-loaded components in main file | Separate pages, lazy-loaded per step |

## Best Practices Enforced

### ✅ Do
1. Use `useApp()` hook for all global state
2. Call `addToast()` for all user feedback (not `alert()`)
3. Use page components for major workflows
4. Lazy-load heavy components
5. Add TypeScript types to all props and hooks

### ❌ Don't
1. Pass state through props (use context)
2. Use local state for workflow steps
3. Import all components at top level
4. Create new top-level routes outside pages/
5. Use `console.log` in production (esbuild drops these)

## Testing Strategy

### Component Tests
```bash
npm test
# Vitest configured in vitest.config.ts
# Tests in *.test.tsx files
```

### Page Testing Template
```typescript
import { render } from "@testing-library/react";
import { AppProvider } from "../contexts/AppContext";
import IntakePage from "./IntakePage";

test("renders intake form", () => {
  render(
    <AppProvider>
      <IntakePage />
    </AppProvider>
  );
  // assertions...
});
```

## Environment Variables

Required in `.env.local`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=displaycellpros-com
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_RECAPTCHA_SITE_KEY=...
GEMINI_API_KEY=...  # For server-side AI
```

## Monitoring & Analytics

### Error Tracking
- Firebase Crashlytics captures unhandled errors
- Console warnings logged for debugging

### Performance Monitoring
- Vite dev server HMR disabled during agent edits (`DISABLE_HMR=true`)
- Production builds have sourcemaps disabled
- Console logging stripped via esbuild

## Security

### Client-Side
- Firebase App Check validates requests
- reCAPTCHA Enterprise on forms
- Anonymous auth fallback for offline resilience

### Server-Side
- Lexical egress firewall sanitizes API responses
- NIST SP 800-88 R1 certification for data handling
- Firestore security rules enforce user-scoped access

## Next Steps

1. **Cutover Plan:**
   - Test `App-redesigned.tsx` in staging
   - A/B test vs. old App.tsx
   - Migrate Firebase rules if needed

2. **Enhancements:**
   - Add persistent draft saving to localStorage
   - Implement PDF quote generation
   - Add customer email notifications

3. **Scale:**
   - Monitor bundle size with `npm run build --stats`
   - Track Core Web Vitals in production
   - Gather user feedback on workflow

## Support

- **Questions?** See AGENTS.md for architecture decisions
- **Bugs?** File issues in the project repo
- **Performance?** Use Chrome DevTools Lighthouse audit

---

**Version:** 2.0 (Redesigned Static SPA)
**Last Updated:** July 2026
**Maintained By:** Display & Cell Pros Engineering

