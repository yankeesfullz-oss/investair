"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  STORAGE_KEYS,
  formatLocaleLabel,
  formatRegionLabel,
  getCountryPreference,
} from "@/lib/countryConfig";

function getCookieValue(name) {
  if (typeof document === "undefined") {
    return null;
  }

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function GeoSuggestionPopup() {
  const pathname = usePathname();
  const [suggestion, setSuggestion] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (pathname?.startsWith("/admin") || pathname?.startsWith("/investor")) {
        return;
      }

      const dismissed = localStorage.getItem(STORAGE_KEYS.geoDismissed);
      const existingLocale = localStorage.getItem(STORAGE_KEYS.language);
      const existingCurrency = localStorage.getItem(STORAGE_KEYS.currency);

      if (dismissed || existingLocale || existingCurrency) {
        return;
      }

      const countryCode = getCookieValue("user-country");
      const detectedPreference = getCountryPreference(countryCode);

      if (!detectedPreference) {
        return;
      }

      setSuggestion(detectedPreference);
      setShow(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  function closeWithDismiss() {
    localStorage.setItem(STORAGE_KEYS.geoDismissed, "true");
    setShow(false);
  }

  function acceptSuggestion() {
    if (!suggestion) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.country, suggestion.country);
    localStorage.setItem(STORAGE_KEYS.language, suggestion.locale);
    localStorage.setItem(STORAGE_KEYS.currency, suggestion.currency);
    localStorage.setItem(STORAGE_KEYS.geoDismissed, "true");
    window.dispatchEvent(new Event("storage"));
    setShow(false);
  }

  if (!show || !suggestion) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-0 sm:bottom-6">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)]">
        <p className="text-sm font-medium text-neutral-500">Suggested for you</p>
        <h2 className="mt-2 text-xl font-semibold text-neutral-950">
          Switch to {formatLocaleLabel(suggestion.locale, suggestion.country)} and {suggestion.currency}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          We detected {formatRegionLabel(suggestion.country) || "your region"} and can set a better default language and currency for this visit.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={acceptSuggestion}
            className="flex-1 rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Yes, switch
          </button>
          <button
            onClick={closeWithDismiss}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
