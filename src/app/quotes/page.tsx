"use client";

import React from 'react';
import { QuotesView } from '@/components/QuotesView';
import { useRouter } from 'next/navigation';

export default function QuotesPage() {
  const router = useRouter();

  return (
    <QuotesView
      onNavigateHome={() => router.push('/')}
      onBookClick={() => {
        if (typeof window !== "undefined") {
          window.location.href = '/?book=true';
        }
      }}
    />
  );
}
