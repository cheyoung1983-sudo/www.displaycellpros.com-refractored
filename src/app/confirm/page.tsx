"use client";

import React from 'react';
import { ConfirmationView } from '../../components/ConfirmationView';
import { useRouter } from 'next/navigation';

export default function ConfirmPage() {
  const router = useRouter();

  return (
    <ConfirmationView
      pageType="confirm"
      onNavigateHome={() => router.push('/')}
      onBookClick={() => {
        if (typeof window !== "undefined") {
          window.location.href = '/?book=true';
        }
      }}
    />
  );
}
