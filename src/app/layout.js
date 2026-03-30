import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PublicAppShell from "@/components/Public/PublicAppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://investair.example.com"),
  title: {
    template: "%s | Investair Rentals",
    default: "Investair Rentals - Nationwide Apartments for Rent & Investment Properties",
  },
  description: "Discover real estate investment properties and apartments for rent nationwide. Investair Rentals offers opportunities for both renters looking for apartments and real estate investors.",
  keywords: ["apartments for rent", "apts for rent", "rentals", "real estate investment", "invest in property", "nationwide rentals"],
  openGraph: {
    title: "Investair Rentals - Nationwide Apartments for Rent",
    description: "Discover real estate investment properties and apartments for rent nationwide.",
    url: "/",
    siteName: "Investair Rentals",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PublicAppShell>{children}</PublicAppShell>
      </body>
    </html>
  );
}
