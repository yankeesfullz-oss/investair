"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  DEFAULT_SITE_CURRENCY,
  DEFAULT_SITE_LANGUAGE,
  STORAGE_KEYS,
  toGoogleTranslateLanguage,
} from "@/lib/countryConfig";

const GOOGLE_TRANSLATE_ELEMENT_ID = "investair-google-translate-element";
const GOOGLE_TRANSLATE_SCRIPT_ID = "investair-google-translate-script";
const GOOGLE_TRANSLATE_SCRIPT_URL = "https://translate.google.com/translate_a/element.js?cb=investairGoogleTranslateElementInit";
const INCLUDED_TRANSLATE_LANGUAGES = ["ar", "de", "en", "es", "fr", "hi", "it", "ja", "nl", "pt", "sv", "zh-CN"];
const GOOGLE_TRANSLATE_RESET_DELAY_MS = 80;

const LanguagePreferenceContext = createContext({
  closeSelector: () => {},
  currentCountry: null,
  currentCurrency: DEFAULT_SITE_CURRENCY,
  currentLocale: DEFAULT_SITE_LANGUAGE,
  openSelector: () => {},
  resetLanguagePreferences: () => {},
  selectorOpen: false,
  setPreferences: () => {},
  translatorReady: false,
});

function readStoredPreferences() {
  if (typeof window === "undefined") {
    return {
      country: null,
      currency: DEFAULT_SITE_CURRENCY,
      locale: DEFAULT_SITE_LANGUAGE,
    };
  }

  return {
    country: window.localStorage.getItem(STORAGE_KEYS.country),
    currency: window.localStorage.getItem(STORAGE_KEYS.currency) || DEFAULT_SITE_CURRENCY,
    locale: window.localStorage.getItem(STORAGE_KEYS.language) || DEFAULT_SITE_LANGUAGE,
  };
}

function setGoogleTranslateCookie(languageCode) {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const hostname = window.location.hostname;
  const cookieTargets = ["path=/"];

  if (hostname) {
    cookieTargets.push(`path=/; domain=${hostname}`);
    if (hostname.includes(".")) {
      cookieTargets.push(`path=/; domain=.${hostname.replace(/^\./, "")}`);
    }
  }

  if (!languageCode || languageCode === "en") {
    for (const target of cookieTargets) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${target}`;
    }
    return;
  }

  for (const target of cookieTargets) {
    document.cookie = `googtrans=/auto/${languageCode}; ${target}`;
  }
}

function dispatchNativeChange(element) {
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function clearGoogleTranslateArtifacts() {
  if (typeof document === "undefined") {
    return;
  }

  setGoogleTranslateCookie("en");
  document.body?.classList.remove("translated-ltr", "translated-rtl");
  document.documentElement.classList.remove("translated-ltr", "translated-rtl");

  const bannerFrame = document.querySelector("iframe.goog-te-banner-frame");
  bannerFrame?.remove();

  const select = document.querySelector(".goog-te-combo");
  if (select) {
    select.value = "";
  }
}

export function useLanguagePreference() {
  return useContext(LanguagePreferenceContext);
}

export default function LanguagePreferenceProvider({ children }) {
  const googleLanguageRef = useRef("en");
  const [currentCountry, setCurrentCountry] = useState(() => readStoredPreferences().country);
  const [currentCurrency, setCurrentCurrency] = useState(() => readStoredPreferences().currency);
  const [currentLocale, setCurrentLocale] = useState(() => readStoredPreferences().locale);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [translatorReady, setTranslatorReady] = useState(false);

  useEffect(() => {
    const googleLanguage = toGoogleTranslateLanguage(currentLocale);

    googleLanguageRef.current = googleLanguage;
    document.documentElement.lang = currentLocale.split("-")[0] || "en";
    setGoogleTranslateCookie(googleLanguage);
  }, [currentLocale]);

  useEffect(() => {
    function handleStorage() {
      const stored = readStoredPreferences();
      setCurrentCountry(stored.country);
      setCurrentCurrency(stored.currency);
      setCurrentLocale(stored.locale);
      document.documentElement.lang = stored.locale.split("-")[0] || "en";
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function applyPendingLanguage() {
      const select = document.querySelector(".goog-te-combo");
      if (!select) {
        return false;
      }

      const targetLanguage = googleLanguageRef.current;
      if (targetLanguage && targetLanguage !== "en") {
        select.value = targetLanguage;
        dispatchNativeChange(select);
      }

      setTranslatorReady(true);
      return true;
    }

    window.investairGoogleTranslateElementInit = function investairGoogleTranslateElementInit() {
      if (!window.google?.translate?.TranslateElement) {
        return;
      }

      if (!document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID)?.childElementCount) {
        new window.google.translate.TranslateElement(
          {
            autoDisplay: false,
            includedLanguages: INCLUDED_TRANSLATE_LANGUAGES.join(","),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            pageLanguage: "en",
          },
          GOOGLE_TRANSLATE_ELEMENT_ID
        );
      }

      const intervalId = window.setInterval(() => {
        if (applyPendingLanguage()) {
          window.clearInterval(intervalId);
        }
      }, 200);

      window.setTimeout(() => window.clearInterval(intervalId), 5000);
    };

    if (!document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
      script.src = GOOGLE_TRANSLATE_SCRIPT_URL;
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.investairGoogleTranslateElementInit();
    }

    return () => {
      delete window.investairGoogleTranslateElementInit;
    };
  }, []);

  function persistPreferences({ country, currency, locale, clearLanguageStorage = false }) {
    if (typeof window === "undefined") {
      return;
    }

    if (clearLanguageStorage) {
      window.localStorage.removeItem(STORAGE_KEYS.country);
      window.localStorage.removeItem(STORAGE_KEYS.language);
      window.localStorage.removeItem(STORAGE_KEYS.geoDismissed);
    } else if (country) {
      window.localStorage.setItem(STORAGE_KEYS.country, country);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.country);
    }

    window.localStorage.setItem(STORAGE_KEYS.currency, currency || DEFAULT_SITE_CURRENCY);

    if (clearLanguageStorage) {
      window.localStorage.removeItem(STORAGE_KEYS.language);
    } else {
      window.localStorage.setItem(STORAGE_KEYS.language, locale || DEFAULT_SITE_LANGUAGE);
      window.localStorage.setItem(STORAGE_KEYS.geoDismissed, "true");
    }

    window.dispatchEvent(new Event("storage"));
  }

  function applyPreferenceState({ country, currency, locale }) {
    setCurrentCountry(country);
    setCurrentCurrency(currency || DEFAULT_SITE_CURRENCY);
    setCurrentLocale(locale || DEFAULT_SITE_LANGUAGE);
    document.documentElement.lang = (locale || DEFAULT_SITE_LANGUAGE).split("-")[0] || "en";
    googleLanguageRef.current = toGoogleTranslateLanguage(locale || DEFAULT_SITE_LANGUAGE);
  }

  function reloadForEnglishReset() {
    clearGoogleTranslateArtifacts();
    setTranslatorReady(false);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        window.location.reload();
      }, GOOGLE_TRANSLATE_RESET_DELAY_MS);
    }
  }

  function setPreferences({ country = null, currency = DEFAULT_SITE_CURRENCY, locale = DEFAULT_SITE_LANGUAGE }) {
    const nextLocale = locale || DEFAULT_SITE_LANGUAGE;
    const nextCurrency = currency || DEFAULT_SITE_CURRENCY;
    const nextGoogleLanguage = toGoogleTranslateLanguage(nextLocale);
    const previousGoogleLanguage = googleLanguageRef.current;

    if (typeof window !== "undefined") {
      persistPreferences({
        country,
        currency: nextCurrency,
        locale: nextLocale,
      });
    }

    applyPreferenceState({
      country,
      currency: nextCurrency,
      locale: nextLocale,
    });

    if (nextGoogleLanguage === "en") {
      if (previousGoogleLanguage !== "en") {
        reloadForEnglishReset();
      } else {
        clearGoogleTranslateArtifacts();
      }
      return;
    }

    setGoogleTranslateCookie(nextGoogleLanguage);

    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = nextGoogleLanguage;
      dispatchNativeChange(select);
    }
  }

  function resetLanguagePreferences() {
    const preservedCurrency = typeof window === "undefined"
      ? currentCurrency || DEFAULT_SITE_CURRENCY
      : window.localStorage.getItem(STORAGE_KEYS.currency) || currentCurrency || DEFAULT_SITE_CURRENCY;

    if (typeof window !== "undefined") {
      persistPreferences({
        country: null,
        currency: preservedCurrency,
        locale: DEFAULT_SITE_LANGUAGE,
        clearLanguageStorage: true,
      });
    }

    applyPreferenceState({
      country: null,
      currency: preservedCurrency,
      locale: DEFAULT_SITE_LANGUAGE,
    });
    reloadForEnglishReset();
  }

  const value = {
    closeSelector: () => setSelectorOpen(false),
    currentCountry,
    currentCurrency,
    currentLocale,
    openSelector: () => setSelectorOpen(true),
    resetLanguagePreferences,
    selectorOpen,
    setPreferences,
    translatorReady,
  };

  return (
    <LanguagePreferenceContext.Provider value={value}>
      <div id={GOOGLE_TRANSLATE_ELEMENT_ID} className="sr-only" aria-hidden="true" />
      {children}
    </LanguagePreferenceContext.Provider>
  );
}