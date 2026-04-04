const TAWK_SCRIPT_URL = 'https://embed.tawk.to/69cb8cbb8a92ab1c373e7f33/1jl1hrfl1';

let tawkPromise = null;

function buildWalletSummary(wallets = []) {
  return wallets
    .map((wallet) => `${wallet.currency}:${Number(wallet.availableBalance || 0)}`)
    .join(' | ')
    .slice(0, 240);
}

function applyAttributes({ user, wallets, sessionId }) {
  if (typeof window === 'undefined' || !window.Tawk_API?.setAttributes || !user) {
    return;
  }

  window.Tawk_API.setAttributes(
    {
      name: user.fullName || 'Investor',
      email: user.email || '',
      sessionId: sessionId || '',
      walletSummary: buildWalletSummary(wallets),
      primaryWallet: wallets?.[0]?.address || '',
    },
    () => {}
  );
}

export function loadTawk(context = {}) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Live support is only available in the browser.'));
  }

  if (window.Tawk_API?.maximize) {
    applyAttributes(context);
    return Promise.resolve(window.Tawk_API);
  }

  if (tawkPromise) {
    return tawkPromise.then((api) => {
      applyAttributes(context);
      return api;
    });
  }

  tawkPromise = new Promise((resolve, reject) => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    window.Tawk_API.onLoad = function onLoad() {
      applyAttributes(context);
      resolve(window.Tawk_API);
    };

    const existing = document.querySelector(`script[src="${TAWK_SCRIPT_URL}"]`);
    if (existing) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = TAWK_SCRIPT_URL;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    script.onerror = () => reject(new Error('Unable to load live support right now.'));

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  });

  return tawkPromise;
}

export async function openTawkSupport(context = {}) {
  const api = await loadTawk(context);
  applyAttributes(context);
  if (typeof api.maximize === 'function') {
    api.maximize();
  }

  return api;
}