import React, { useEffect, useRef } from 'react';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import {
  EmailAuthProvider,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface FirebaseUIAuthProps {
  onSignInSuccess?: (authResult: any, redirectUrl?: string) => boolean;
}

/**
 * 🔐 FIREBASE UI AUTH GATEWAY
 * Implements the standard Firebase Auth UI within the Forensic Hub.
 * Optimized for legacy credential migration and rapid SSO testing.
 */
export const FirebaseUIAuth: React.FC<FirebaseUIAuthProps> = ({ onSignInSuccess }) => {
  const uiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the FirebaseUI Widget
    // singleton check to prevent "AuthUI instance already exists" errors
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    const uiConfig: firebaseui.auth.Config = {
      signInOptions: [
        {
          provider: EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: true,
          signInMethod: EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
        },
        GoogleAuthProvider.PROVIDER_ID,
      ],
      signInFlow: 'popup',
      signInSuccessUrl: '/dashboard',
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          console.log('[AUTH] Forensic node verified via FirebaseUI');
          if (onSignInSuccess) {
            return onSignInSuccess(authResult, redirectUrl);
          }
          return true; // Default to redirect
        },
      },
      credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
      tosUrl: '/terms',
      privacyPolicyUrl: '/privacy',
    };

    if (uiContainerRef.current) {
      ui.start(uiContainerRef.current, uiConfig);
    }

    return () => {
      // We don't necessarily want to delete the UI on unmount to keep it as a singleton,
      // but if we were to clean up: ui.reset();
    };
  }, [onSignInSuccess]);

  return (
    <div className="w-full bg-[#0a0a0a] rounded-xl p-4 border border-slate-800 shadow-inner">
      <div className="mb-4 text-center">
        <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.2em] font-mono">
          Standard Identity Gateway
        </h4>
      </div>
      <div ref={uiContainerRef} id="firebaseui-auth-container" className="firebaseui-custom-overrides" />
      <style>{`
        .firebaseui-custom-overrides .firebaseui-container {
          background-color: transparent !important;
          box-shadow: none !important;
          max-width: 100% !important;
        }
        .firebaseui-custom-overrides .firebaseui-card-content {
          padding: 0 !important;
        }
        .firebaseui-custom-overrides .firebaseui-label {
          color: #94a3b8 !important; /* slate-400 */
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
        }
        .firebaseui-custom-overrides .firebaseui-idp-button {
          border-radius: 12px !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
      `}</style>
    </div>
  );
};
