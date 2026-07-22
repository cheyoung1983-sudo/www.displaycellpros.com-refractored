"use client";

import React from 'react';
import { HomeView } from '@/components/HomeView';

export default function Home() {
  return (
    <HomeView
      onBookClick={() => {
        // This will be handled by the LayoutWrapper's FAB or we can use a context
        // For now, let's just trigger the global AI widget if possible
        // But since they are separated, I'll need a way to communicate.
      }}
      onLabClick={() => {
        window.location.href = '/lab';
      }}
    />
  );
}
