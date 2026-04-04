"use client";

import { useEffect, useMemo, useState } from 'react';

const installPromptStore = globalThis.__investAirInstallPromptStore || {
  subscribers: new Set(),
  sharedPromptState: {
    deferredPrompt: null,
    platform: 'desktop',
    isInstalled: false,
  },
  listenersAttached: false,
};

globalThis.__investAirInstallPromptStore = installPromptStore;

function getPlatform(userAgent) {
  const normalizedUserAgent = String(userAgent || '').toLowerCase();

  if (/iphone|ipad|ipod/.test(normalizedUserAgent)) {
    return 'ios';
  }

  if (/android/.test(normalizedUserAgent)) {
    return 'android';
  }

  return 'desktop';
}

function isStandaloneDisplay() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function emitPromptState() {
  installPromptStore.subscribers.forEach((subscriber) => subscriber(installPromptStore.sharedPromptState));
}

function updateSharedPromptState(nextState) {
  installPromptStore.sharedPromptState = {
    ...installPromptStore.sharedPromptState,
    ...nextState,
  };
  emitPromptState();
}

function ensurePromptListeners() {
  if (installPromptStore.listenersAttached || typeof window === 'undefined') {
    return;
  }

  installPromptStore.listenersAttached = true;

  const mediaQuery = window.matchMedia('(display-mode: standalone)');

  function updateInstalledState() {
    updateSharedPromptState({ isInstalled: isStandaloneDisplay() });
  }

  function handleBeforeInstallPrompt(event) {
    event.preventDefault();
    updateSharedPromptState({ deferredPrompt: event });
  }

  function handleInstalled() {
    updateSharedPromptState({ deferredPrompt: null });
    updateInstalledState();
  }

  updateSharedPromptState({
    platform: getPlatform(window.navigator.userAgent),
    isInstalled: isStandaloneDisplay(),
  });

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleInstalled);

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', updateInstalledState);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(updateInstalledState);
  }
}

export default function useAppInstallPrompt() {
  const [promptState, setPromptState] = useState(installPromptStore.sharedPromptState);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    installPromptStore.subscribers.add(setPromptState);
    ensurePromptListeners();

    return () => {
      installPromptStore.subscribers.delete(setPromptState);
    };
  }, []);

  const { deferredPrompt, isInstalled, platform } = promptState;

  const instructions = useMemo(() => {
    if (isInstalled) {
      return {
        title: 'InvestAir is already installed',
        action: 'Open the app from your home screen or app launcher.',
        hint: 'You already have the mobile app experience enabled on this device.',
      };
    }

    if (deferredPrompt) {
      return {
        title: 'Install with one tap',
        action: 'Use the install button to add InvestAir to your home screen.',
        hint: 'Your browser supports the native install prompt.',
      };
    }

    if (platform === 'ios') {
      return {
        title: 'Install on iPhone',
        action: 'Open Share in Safari, then choose Add to Home Screen.',
        hint: 'iPhone uses Safari’s Add to Home Screen flow instead of a browser prompt.',
      };
    }

    if (platform === 'android') {
      return {
        title: 'Install on Android',
        action: 'Open the browser menu and tap Install app or Add to Home Screen.',
        hint: 'If the prompt does not appear automatically, the browser menu still provides the install option.',
      };
    }

    return {
      title: 'Send to your phone',
      action: 'Scan the QR code with your phone, then use the install option from your mobile browser.',
      hint: 'Install works best when you open InvestAir on the device you want to add it to.',
    };
  }, [deferredPrompt, isInstalled, platform]);

  async function install() {
    const prompt = installPromptStore.sharedPromptState.deferredPrompt;

    if (!prompt) {
      return false;
    }

    prompt.prompt();

    try {
      const outcome = await prompt.userChoice;
      updateSharedPromptState({ deferredPrompt: null });
      return outcome?.outcome === 'accepted';
    } catch {
      updateSharedPromptState({ deferredPrompt: null });
      return false;
    }
  }

  return {
    canInstall: Boolean(deferredPrompt),
    install,
    instructions,
    isInstalled,
    platform,
  };
}