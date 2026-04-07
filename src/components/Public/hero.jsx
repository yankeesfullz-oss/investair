"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "./searchBar";
import { useSearchExperience } from "./searchExperienceProvider";

const HERO_COPY = {
  buy: {
    badge: "Discover guest-ready property markets",
    title: "Explore short-stay real estate opportunities with clearer investor context.",
    description:
      "Search demand-led locations, compare guest-ready assets, and understand how each market fits a modern short-term rental strategy.",
    primaryHref: "/investor/signup",
    primaryLabel: "Explore Opportunities",
  },
  invest: {
    badge: "Structured short-stay investment access",
    title: "Reserve income periods on guest-ready properties.",
    description:
      "Browse curated properties, choose a supported duration, and participate in rental cashflow tied to actual booking performance and operating results.",
    primaryHref: "/investor/signup",
    primaryLabel: "Start Investing",
  },
};

// --- REMOVED: Gradient Background object ---
// const heroBackground = { ... };

export default function Hero() {
  const { mode } = useSearchExperience();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);

  const copy = HERO_COPY[mode] || HERO_COPY.buy;
  const imageUrl = "https://res.cloudinary.com/daeovybod/image/upload/v1775548665/The_dream_tdew2v.jpg";

  return (
    // We remove style={heroBackground} and add overflow-hidden to main
    <main className="relative min-h-screen overflow-hidden text-slate-900 flex items-center">
      
      {/* --- THE BLURRY BACKGROUND IMAGE LAYER --- */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(1px)', // base blur on the image itself
          transform: 'scale(1.05)', // Prevents blurry edges from showing black/transparent
          zIndex: -2,
        }}
      />

      {/* --- Semi-transparent blur overlay between image and card --- */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(255,255,255,0.28)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: -1,
        }}
      />

      {/* --- GLASS CARD MAIN CONTENT --- */}
      {/* The <section> defines the layout on the background and is centered */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-10 md:py-14 flex w-full items-center justify-center">
        
        {/* --- The actual Glass Card --- */}
        <div
          className="w-full max-w-3xl rounded-[2.5rem] border border-white/70 bg-linear-to-br from-white/80 to-white/70 p-5 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-8 md:p-12"
        >
          <div className={`max-w-3xl transition duration-300 ${isReady ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
            <p className="mb-4 inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">
              {copy.badge}
            </p>
            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              {copy.title}
            </h1>
            <p className="mb-10 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              {copy.description}
            </p>
          </div>

          <SearchBar />

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={copy.primaryHref} className="rounded-2xl bg-slate-900 px-6 py-3 text-center text-white transition hover:bg-slate-800">
              {copy.primaryLabel}
            </Link>
            <Link href="/investor/login" className="rounded-2xl border border-slate-200 px-6 py-3 text-center text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              Investor Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}