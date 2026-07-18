import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {SpeedInsights} from '@vercel/speed-insights/react';
import App from './App.tsx';
import './index.css';

// Intercept and ignore benign Vite HMR websocket and network failure logs during container boot
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason || '');
    if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('vite') || msg.includes('HMR')) {
      event.preventDefault();
      console.info('[HMR Ignored Rejection]:', event.reason);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('vite') || msg.includes('HMR')) {
      event.preventDefault();
      console.info('[HMR Ignored Error]:', event.message);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SpeedInsights />
  </StrictMode>,
);

