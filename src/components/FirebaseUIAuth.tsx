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
 * 🔐 HARDENED FIREBASE UI AUTH GATEWAY
 * Restricts scopes to the Identity-Only Tier (openid, email, profile).
 * Purged: Google Drive, Sheets, Docs, and Chat to bypass CASA audit requirements.
 */
export const FirebaseUIAuth: React.FC<FirebaseUIAuthProps> = ({ onSignInSuccess }) => {
  const uiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the FirebaseUI Widget
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    const uiConfig: firebaseui.auth.Config = {
      signInOptions: [
        {
          provider: EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: true,
          signInMethod: EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
        },
        {
          provider: GoogleAuthProvider.PROVIDER_ID,
          scopes: [
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
          ],
          customParameters: {
            prompt: 'select_account'
          }
        },
      ],
      signInFlow: 'popup',
      signInSuccessUrl: '/dashboard',
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          console.log('[AUTH_SUCCESS] Forensic identity verified via Hardened OIDC Gateway.');
          if (onSignInSuccess) {
            return onSignInSuccess(authResult, redirectUrl);
          }
          return true;
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
      // Cleanup is usually handled by keeping it as a singleton
    };
  }, [onSignInSuccess]);

  return (
    <div className="w-full bg-[#0a0a0a] rounded-xl p-4 border border-slate-800 shadow-inner">
      <div className="mb-4 text-center">
        <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.2em] font-mono">
          Standard Identity Gateway (Hardened)
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
          color: #94a3b8 !important;
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
