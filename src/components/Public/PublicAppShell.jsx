"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Public/navbar";
import Footer from "@/components/Public/footer";
import GeoSuggestionPopup from "@/components/Public/geoSuggestionPopup";
import { SearchExperienceProvider } from "@/components/Public/searchExperienceProvider";
import AuthProvider from "@/context/AuthProvider";
import InvestAirChatWidget from "@/components/ChatWidget/InvestAirChatWidget";

export default function PublicAppShell({ children }) {
  const pathname = usePathname();
  const hidePublicChrome = pathname?.startsWith("/admin") || pathname?.startsWith("/investor");

  return (
    <AuthProvider>
      <SearchExperienceProvider>
      {!hidePublicChrome && <Navbar />}
      {!hidePublicChrome && <GeoSuggestionPopup />}
      <div style={{ minHeight: "70vh" }}>{children}</div>
      {!hidePublicChrome && <Footer />}
      {!pathname?.startsWith("/admin") && (
        <Suspense fallback={null}>
          <InvestAirChatWidget />
        </Suspense>
      )}
      </SearchExperienceProvider>
    </AuthProvider>
  );
}