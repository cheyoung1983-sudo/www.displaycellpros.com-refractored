import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 1. Prioritize React and core scheduling logic into 'vendor'
            // to prevent circular chunk dependencies and uninitialized state.
            if (
              id.includes('react/') ||
              id.includes('react-dom/') ||
              id.includes('scheduler/') ||
              id.includes('@remix-run/router') ||
              id.includes('react-router')
            ) {
              return 'vendor';
            }

            // 2. Separate large, independent libraries
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('@google/genai')) return 'genai-vendor';
            if (id.includes('recharts')) return 'recharts-vendor';
            if (id.includes('jspdf')) return 'jspdf-vendor';
            if (id.includes('lucide-react')) return 'lucide-vendor';
            if (id.includes('motion')) return 'motion-vendor';

            // 3. Everything else goes to the main vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
});
