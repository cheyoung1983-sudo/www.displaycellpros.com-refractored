"use client";

import React from 'react';
import { InquiryView } from '../../components/InquiryView';
import { useRouter } from 'next/navigation';

export default function InquiryPage() {
  const router = useRouter();

  return (
    <InquiryView
      onNavigateHome={() => router.push('/')}
      onBookClick={() => {
        if (typeof window !== "undefined") {
          window.location.href = '/?book=true';
        }
      }}
    />
  );
}
