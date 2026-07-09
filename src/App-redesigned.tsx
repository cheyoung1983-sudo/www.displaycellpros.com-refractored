import React, { Suspense, useEffect, useState } from "react";
import { AppProvider, useApp } from "./contexts/AppContext";
import { ToastContainer } from "./components/ToastNotification";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "./lib/firebase";
import { motion, AnimatePresence } from "motion/react";

// Lazy-loaded page components (optimized for static SPA)
const IntakePage = React.lazy(() => import("./pages/IntakePage"));
const DiagnosticsPage = React.lazy(() => import("./pages/DiagnosticsPage"));
const QuotePage = React.lazy(() => import("./pages/QuotePage"));
const ConfirmationPage = React.lazy(() => import("./pages/ConfirmationPage"));

// Loading fallback for page transitions
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#111111] bg-opacity-80 backdrop-blur-sm z-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00BFFF] mx-auto mb-4"></div>
      <p className="text-[#00BFFF] font-mono text-sm">Initializing forensic audit engine...</p>
    </div>
  </div>
);

/**
 * AppContent Component - Main page router & state synchronizer
 * Handles page transitions, authentication, and UI state
 */
function AppContent() {
  const { currentStep, setAuthUser, isLoading, setIsLoading } = useApp();
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Firebase Auth on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setAuthUser(user);
        } else {
          // Fallback to anonymous auth for public access
          try {
            await signInAnonymously(auth);
          } catch (err) {
            console.warn("Anonymous auth fallback failed:", err);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsInitializing(false);
      }
    });
    return () => unsubscribe();
  }, [setAuthUser]);

  if (isInitializing) {
    return <PageLoader />;
  }

  return (
    <>
      {/* Main Page Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<PageLoader />}>
            {currentStep === "intake" && <IntakePage />}
            {currentStep === "diagnostics" && <DiagnosticsPage />}
            {currentStep === "quote" && <QuotePage />}
            {currentStep === "confirmation" && <ConfirmationPage />}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Loading Overlay */}
      {isLoading && <PageLoader />}

      {/* Toast Notifications */}
      <ToastContainer />
    </>
  );
}

/**
 * Root App Component - Provides context and renders main content
 */
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

