"use client";

import React from 'react';
import { ConfirmationView } from '@/components/ConfirmationView';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
  const router = useRouter();

  return (
    <ConfirmationView
      pageType="schedule"
      onNavigateHome={() => router.push('/')}
      onBookClick={() => {
        if (typeof window !== "undefined") {
          window.location.href = '/?book=true';
        }
      }}
    />
  );
}
