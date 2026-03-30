"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "./searchBar";
import { useSearchExperience } from "./searchExperienceProvider";

const HERO_COPY = {
  buy: {
    badge: "Find high-conviction property markets",
    title: "Buy residential and commercial property with cleaner discovery.",
    description:
      "Search premium locations, compare investor-friendly markets, and move from discovery to opportunity without a bloated booking flow.",
    primaryHref: "/investor/signup",
    primaryLabel: "Start Buying",
  },
  invest: {
    badge: "Structured investment opportunities",
    title: "Invest by city and duration with a tighter decision flow.",
    description:
      "Pick a location, set your preferred months, and surface opportunities that align with your time horizon and funding plan.",
    primaryHref: "/investor/signup",
    primaryLabel: "Start Investing",
  },
};

export default function Hero() {
  const { mode } = useSearchExperience();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);

  const copy = HERO_COPY[mode] || HERO_COPY.buy;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,207,232,0.55),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(191,219,254,0.5),_transparent_28%),linear-gradient(180deg,_#fff8fb_0%,_#ffffff_42%,_#f8fafc_100%)] px-4 py-10 text-slate-900 sm:px-6 md:px-10 md:py-14">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-white/70 bg-white/75 px-5 py-8 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-8 md:px-12 md:py-12">
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
          <Link href="/admin/login" className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-3 text-center text-rose-700 transition hover:bg-rose-100">
            Admin Login
          </Link>
        </div>
      </section>
    </main>
  );
}
