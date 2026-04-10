import "./globals.css";
import LanguageSelectorOverlay from "@/components/Language/LanguageSelectorOverlay";
import PublicAppShell from "@/components/Public/PublicAppShell";
import PwaRegistration from "@/components/Public/PwaRegistration";
import LanguagePreferenceProvider from "@/context/LanguagePreferenceProvider";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

export const metadata = {
  applicationName: "InvestAir",
  metadataBase: new URL(getSiteUrl()),
  manifest: "/manifest.webmanifest",
  title: {
    template: "%s | InvestAir",
    default: "InvestAir | Short-Term Rental Investment Platform",
  },
  description: "InvestAir helps investors discover guest-ready properties, reserve structured rental-income periods, and participate in short-term rental cashflow through a modern platform.",
  keywords: ["short-term rental investment", "rental income investing", "guest-ready properties", "rental cashflow", "property investment platform", "crypto funded investing"],
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", type: "image/svg+xml" },
      { url: "/icon-512.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon-192.svg", type: "image/svg+xml" }],
    shortcut: ["/icon-192.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InvestAir",
  },
  openGraph: {
    title: "InvestAir | Short-Term Rental Investment Platform",
    description: "Discover guest-ready properties, compare projected rental performance, and access structured short-term rental investment opportunities.",
    url: absoluteUrl("/"),
    siteName: "InvestAir",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvestAir | Short-Term Rental Investment Platform",
    description: "Discover guest-ready properties, compare projected rental performance, and access structured short-term rental investment opportunities.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "InvestAir",
      url: getSiteUrl(),
      logo: absoluteUrl("/icon-512.svg"),
      description: "InvestAir helps investors discover guest-ready properties and access structured short-term rental investment opportunities.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "InvestAir",
      url: getSiteUrl(),
      description: "Short-term rental investment platform with property-based investment opportunities.",
      inLanguage: "en-US",
    },
  ];

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="antialiased"
      >
        <LanguagePreferenceProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          <PwaRegistration />
          <PublicAppShell>{children}</PublicAppShell>
          <LanguageSelectorOverlay />
        </LanguagePreferenceProvider>
      </body>
    </html>
  );
}
