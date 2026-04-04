"use client";

import { useEffect } from 'react';

export default function PwaRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (error) {
        console.error('Unable to register service worker', error);
      }
    };

    window.addEventListener('load', registerServiceWorker, { once: true });

    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  return null;
}