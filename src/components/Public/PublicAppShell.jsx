"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Public/navbar";
import Footer from "@/components/Public/footer";
import GeoSuggestionPopup from "@/components/Public/geoSuggestionPopup";
import { SearchExperienceProvider } from "@/components/Public/searchExperienceProvider";

export default function PublicAppShell({ children }) {
  const pathname = usePathname();
  const hidePublicChrome = pathname?.startsWith("/admin") || pathname?.startsWith("/investor");

  return (
    <SearchExperienceProvider>
      {!hidePublicChrome && <Navbar />}
      {!hidePublicChrome && <GeoSuggestionPopup />}
      <div style={{ minHeight: "70vh" }}>{children}</div>
      {!hidePublicChrome && <Footer />}
    </SearchExperienceProvider>
  );
}