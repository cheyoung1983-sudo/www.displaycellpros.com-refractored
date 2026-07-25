"use client";

import React from 'react';
import { ContactReceivedView } from '@/components/ContactReceivedView';
import { useRouter } from 'next/navigation';

export default function ReceivedPage() {
  const router = useRouter();

  return (
    <ContactReceivedView
      onNavigateHome={() => router.push('/')}
      onBookClick={() => {
        if (typeof window !== "undefined") {
          window.location.href = '/?book=true';
        }
      }}
    />
  );
}
