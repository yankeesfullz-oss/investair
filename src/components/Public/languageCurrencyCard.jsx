"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SITE_LANGUAGE,
  DEFAULT_SITE_CURRENCY,
  formatLocaleLabel,
  getCountryFromLocale,
  getCountryPreference,
} from "@/lib/countryConfig";
import { useLanguagePreference } from "@/context/LanguagePreferenceProvider";

const TABS = {
  LANGUAGE: "language",
  CURRENCY: "currency",
};

export default function LanguageCurrencyCard({ onClose }) {
  const {
    currentCountry,
    currentCurrency,
    currentLocale,
    resetLanguagePreferences,
    setPreferences,
  } = useLanguagePreference();
  const [tab, setTab] = useState(TABS.LANGUAGE);
  const [countriesList, setCountriesList] = useState([]);
  const [currenciesList, setCurrenciesList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(
    () => currentCountry || getCountryFromLocale(currentLocale) || getCountryFromLocale(DEFAULT_SITE_LANGUAGE) || "US"
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    () => currentCurrency || DEFAULT_SITE_CURRENCY
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const countryModule = await import("i18n-iso-countries");
        const countries = countryModule.default || countryModule;
        const enLocale = (await import("i18n-iso-countries/langs/en.json")).default;
        countries.registerLocale(enLocale);

        const allCountries = Object.entries(countries.getNames("en")).map(
          ([code, name]) => ({ code, name })
        );

        setCountriesList(allCountries.sort((a, b) => a.name.localeCompare(b.name)));

        const currencyModule = await import("currency-codes");
        const currencyCodes = currencyModule.default || currencyModule;

        const allCurrencies = currencyCodes.codes().map((code) => {
          const d = currencyCodes.code(code) || {};
          return {
            code: d.code,
            name: d.currency,
          };
        });

        setCurrenciesList(allCurrencies.sort((a, b) => a.code.localeCompare(b.code)));
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    setSelectedCountry(
      currentCountry || getCountryFromLocale(currentLocale) || getCountryFromLocale(DEFAULT_SITE_LANGUAGE) || "US"
    );
  }, [currentCountry, currentLocale]);

  useEffect(() => {
    setSelectedCurrency(currentCurrency || DEFAULT_SITE_CURRENCY);
  }, [currentCurrency]);

  const filteredCountries = useMemo(() => {
    return countriesList.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [countriesList, search]);

  const filteredCurrencies = useMemo(() => {
    return currenciesList.filter(
      (c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [currenciesList, search]);

  function saveAndClose() {
    const preference = getCountryPreference(selectedCountry);

    if (!preference?.locale) {
      return;
    }

    setPreferences({
      country: preference.country,
      currency: selectedCurrency || currentCurrency || preference.currency || DEFAULT_SITE_CURRENCY,
      locale: preference.locale,
    });
    onClose?.();
  }

  function resetLanguageAndClose() {
    setSearch("");
    setSelectedCountry(getCountryFromLocale(DEFAULT_SITE_LANGUAGE) || "US");
    setSelectedCurrency(currentCurrency || DEFAULT_SITE_CURRENCY);
    resetLanguagePreferences();
    onClose?.();
  }

  return (
    <div className="flex justify-center items-center">
      <div className="flex max-h-[calc(100vh-1.5rem)] w-full flex-col overflow-hidden rounded-2xl bg-white sm:max-h-[90vh] sm:rounded-3xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
          <h2 className="text-base font-semibold sm:text-lg">Language and region</h2>
          <button onClick={onClose} className="rounded-full p-2 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900">✕</button>
        </div>

        {/* TABS */}
        <div className="flex border-b">
          <button
            onClick={() => {
              setTab(TABS.LANGUAGE);
              setSearch("");
            }}
            className={`flex-1 px-3 py-3 text-sm sm:text-base ${
              tab === TABS.LANGUAGE
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
          >
            Language & Region
          </button>

          <button
            onClick={() => {
              setTab(TABS.CURRENCY);
              setSearch("");
            }}
            className={`flex-1 px-3 py-3 text-sm sm:text-base ${
              tab === TABS.CURRENCY
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
          >
            Currency
          </button>
        </div>

        {/* SEARCH */}
        <div className="border-b p-4">
          <input
            placeholder={`Search ${tab === "language" ? "countries" : "currencies"}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        {/* CONTENT */}
        <div className="grid flex-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:p-6">

          {/* LANGUAGE TAB */}
          {tab === TABS.LANGUAGE &&
            filteredCountries.map((c) => (
              <div
                key={c.code}
                onClick={() => {
                  const preference = getCountryPreference(c.code);
                  setSelectedCountry(c.code);
                  setSelectedCurrency((currentCurrency) => currentCurrency || preference?.currency || "USD");
                }}
                className="flex cursor-pointer items-center justify-between rounded-xl border p-4 hover:bg-gray-100"
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatLocaleLabel(getCountryPreference(c.code)?.locale, c.code)}
                  </div>
                </div>
                {selectedCountry === c.code && <span>✓</span>}
              </div>
            ))}

          {/* CURRENCY TAB */}
          {tab === TABS.CURRENCY &&
            filteredCurrencies.map((c) => (
              <div
                key={c.code}
                onClick={() => setSelectedCurrency(c.code)}
                className="flex cursor-pointer items-center justify-between rounded-xl border p-4 hover:bg-gray-100"
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.code}</div>
                </div>
                {selectedCurrency === c.code && <span>✓</span>}
              </div>
            ))}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={resetLanguageAndClose}
            className="w-full rounded-lg border border-neutral-300 px-6 py-2 text-neutral-800 transition hover:bg-neutral-50 sm:w-auto"
          >
            Reset language
          </button>
          <button
            onClick={saveAndClose}
            className="w-full rounded-lg bg-black px-6 py-2 text-white sm:w-auto"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}