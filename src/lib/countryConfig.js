export const STORAGE_KEYS = {
  country: "site-country",
  language: "site-language",
  currency: "site-currency",
  geoDismissed: "geo-dismissed",
};

export const countryConfig = {
  AE: { locale: "en-AE", currency: "AED" },
  AU: { locale: "en-AU", currency: "AUD" },
  BR: { locale: "pt-BR", currency: "BRL" },
  CA: { locale: "en-CA", currency: "CAD" },
  CH: { locale: "de-CH", currency: "CHF" },
  CN: { locale: "zh-CN", currency: "CNY" },
  DE: { locale: "de-DE", currency: "EUR" },
  ES: { locale: "es-ES", currency: "EUR" },
  FR: { locale: "fr-FR", currency: "EUR" },
  GB: { locale: "en-GB", currency: "GBP" },
  GH: { locale: "en-GH", currency: "GHS" },
  IN: { locale: "hi-IN", currency: "INR" },
  IT: { locale: "it-IT", currency: "EUR" },
  JP: { locale: "ja-JP", currency: "JPY" },
  KE: { locale: "en-KE", currency: "KES" },
  MX: { locale: "es-MX", currency: "MXN" },
  NG: { locale: "en-NG", currency: "NGN" },
  NL: { locale: "nl-NL", currency: "EUR" },
  QA: { locale: "ar-QA", currency: "QAR" },
  SA: { locale: "ar-SA", currency: "SAR" },
  SE: { locale: "sv-SE", currency: "SEK" },
  SG: { locale: "en-SG", currency: "SGD" },
  US: { locale: "en-US", currency: "USD" },
  ZA: { locale: "en-ZA", currency: "ZAR" },
};

export function normalizeCountryCode(value) {
  return typeof value === "string" && value.trim()
    ? value.trim().toUpperCase()
    : null;
}

export function getCountryFromLocale(locale) {
  if (!locale || typeof locale !== "string") {
    return null;
  }

  const parts = locale.split("-");
  return normalizeCountryCode(parts[1] || parts[0]);
}

export function getCountryPreference(countryCode) {
  const normalizedCountry = normalizeCountryCode(countryCode);

  if (!normalizedCountry) {
    return null;
  }

  return {
    country: normalizedCountry,
    locale: countryConfig[normalizedCountry]?.locale || `en-${normalizedCountry}`,
    currency: countryConfig[normalizedCountry]?.currency || "USD",
  };
}

export function formatLocaleLabel(locale, countryCode) {
  if (!locale) {
    return "English";
  }

  const [languageCode, regionCode] = locale.split("-");

  try {
    const languageName = new Intl.DisplayNames(["en"], {
      type: "language",
    }).of(languageCode);
    const regionName = new Intl.DisplayNames(["en"], {
      type: "region",
    }).of(normalizeCountryCode(regionCode || countryCode));

    return regionName ? `${languageName} (${regionName})` : languageName || locale;
  } catch {
    return locale;
  }
}

export function formatRegionLabel(countryCode) {
  const normalizedCountry = normalizeCountryCode(countryCode);

  if (!normalizedCountry) {
    return null;
  }

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(normalizedCountry);
  } catch {
    return normalizedCountry;
  }
}
