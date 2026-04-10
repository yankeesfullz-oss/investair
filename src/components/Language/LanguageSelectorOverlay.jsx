"use client";

import LanguageCurrencyCard from "@/components/Public/languageCurrencyCard";
import { useLanguagePreference } from "@/context/LanguagePreferenceProvider";

export default function LanguageSelectorOverlay() {
  const { closeSelector, selectorOpen } = useLanguagePreference();

  if (!selectorOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4" onClick={closeSelector}>
      <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        <LanguageCurrencyCard onClose={closeSelector} />
      </div>
    </div>
  );
}