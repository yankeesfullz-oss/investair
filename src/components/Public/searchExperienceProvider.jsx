"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SearchExperienceContext = createContext(null);

const MODE_STORAGE_KEY = "home-search-mode";

function getRouteMode(pathname) {
  if (pathname?.startsWith("/invest") || pathname?.startsWith("/investor")) {
    return "invest";
  }

  return "buy";
}

export function SearchExperienceProvider({ children }) {
  const pathname = usePathname();
  const routeMode = getRouteMode(pathname);
  const [manualMode, setManualMode] = useState("buy");
  const mode = routeMode === "invest" ? routeMode : manualMode || routeMode;

  useEffect(() => {
    if (routeMode === "invest") {
      return;
    }

    const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY);
    const nextMode = storedMode === "buy" || storedMode === "invest" ? storedMode : "buy";
    const frame = window.requestAnimationFrame(() => {
      setManualMode(nextMode);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [routeMode]);

  useEffect(() => {
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  return (
    <SearchExperienceContext.Provider value={{ mode, setMode: setManualMode }}>
      {children}
    </SearchExperienceContext.Provider>
  );
}

export function useSearchExperience() {
  const context = useContext(SearchExperienceContext);

  if (!context) {
    throw new Error("useSearchExperience must be used within SearchExperienceProvider");
  }

  return context;
}
