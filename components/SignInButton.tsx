import React from 'react';
import { signIn } from 'next-auth/react';
import { Inter } from 'next/font/google';
import styles from './SignInButton.module.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600'] });

export default function SignInButton() {
  const handleSignIn = async () => {
    // Initiates Vercel OAuth flow via the /api/auth/signin route we just created
    await signIn('credentials', {
      callbackUrl: '/',
      redirect: false,
    });
  };

  return (
    <button className={`${styles.button} ${inter.className}`} onClick={handleSignIn}>
      <svg
        className={styles.icon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.2 3.197 9.593 7.698 11.274-.106-.956-.202-2.429.042-3.475.219-.945 1.413-6.016 1.413-6.016s-.361-.722-.361-1.787c0-1.674.969-2.925 2.176-2.925.102 0 .202.008.302.024v-.001c.001 0 .002 0 .003 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 0 .001 0 .001 0 .002 .003 0 .026 0 .048 .013-.001 .069 .024 .094.041 .119 .076 .15 .101 .166 .129 .177 .152 .188 .185 .196 .207 .205 .232 .215 .261 .225 .297 .248 .338 .272 .393 .301 .454 .336 .511 .376 .566 .43 .617 .493 .66 .558 .699 .636 .735 .711 .761 1.08.795 1.433.795 2 .795s1.353-.025 1.733-.117c.377-.092.711-.26.993-.481.283-.22 .5-.5 .637-.79 .136-.28 .203-.576 .203-.876v-1.75c-1 .3-2 .6-2.6 .86C19 21 20 .5. .001 .001. .001. The path is omitted for brevity.
      </svg>
      Sign in with Vercel
    </button>
  );
}
