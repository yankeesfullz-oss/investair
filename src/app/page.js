import Link from "next/link";
import { ArrowRight, Building2, CalendarRange, ShieldCheck, Wallet } from "lucide-react";
import BestDealsSection from "@/components/Public/BestDealsSection";
import Hero from "@/components/Public/hero";
import MobileAppInstallSection from "@/components/Public/MobileAppInstallSection";
import TestimonialsSection from "@/components/Public/TestimonialsSection";
import Tutorial from "@/components/Public/Tutorial";

export const metadata = {
  title: "InvestAir | Short-Term Rental Investment Platform",
  description:
    "InvestAir helps investors discover guest-ready properties, reserve structured rental-income periods, and participate in short-term rental cashflow through a modern platform.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <TestimonialsSection />
      <BestDealsSection />

      <section className="bg-rose-50 px-4 pb-8 text-slate-900  sm:px-6 md:px-10 md:pb-12">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Time-based access",
                description:
                  "InvestAir turns rental income windows into structured opportunities, so investors can participate by duration instead of buying and operating an entire building.",
                icon: <CalendarRange className="h-5 w-5 text-rose-500" />,
              },
              {
                title: "Guest-driven performance",
                description:
                  "Opportunities are framed around projected nightly demand, occupancy, and operating efficiency within the short-stay economy.",
                icon: <Building2 className="h-5 w-5 text-rose-500" />,
              },
              {
                title: "Modern funding rails",
                description:
                  "Investor accounts are designed for crypto funding, dashboard tracking, and guided support from signup through withdrawals.",
                icon: <Wallet className="h-5 w-5 text-rose-500" />,
              },
            ].map((item) => (
              <article key={item.title} className="rounded-[2rem] border mt-10 border-slate-100 bg-slate-50 p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-2xl bg-white p-3 shadow-sm">{item.icon}</div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 rounded-[2.5rem] border border-slate-100 bg-[linear-gradient(135deg,#fff7fb_0%,#ffffff_55%,#f8fafc_100%)] p-6 shadow-sm sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <p className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
                How InvestAir works
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Built around the short-stay investment economy.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                InvestAir is designed for investors who want access to short-term rental cashflow without handling sourcing, furnishing, guest communication, cleaning coordination, or daily operations themselves.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Instead of presenting permanent ownership as the only path, the platform centers on reserving structured rental-income periods on guest-ready properties. Returns remain performance-based and depend on booking activity, seasonality, pricing, and operating conditions.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                "Review available properties and estimated performance metrics.",
                "Choose a supported duration such as 3, 6, or 12 months.",
                "Fund your investor account using supported wallet rails.",
                "Track balances, rental activity, payouts, and withdrawals from your dashboard.",
              ].map((step, index) => (
                <div key={step} className="flex gap-4 rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2rem] border border-slate-100 bg-rose-600 p-8 text-white shadow-sm">
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rose-200">
                Transparency first
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">Performance is estimated, not guaranteed.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                InvestAir uses projected and performance-based language intentionally. Rental outcomes vary by occupancy, guest demand, operating cost, local seasonality, and property execution.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/invest" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100">
                  View opportunities
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/about" className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                  About InvestAir
                </Link>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-100 bg-slate-50 p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">What the platform is designed to do</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    The platform helps users discover opportunities, create investor accounts, receive dedicated funding wallets, reserve rental-income periods, and monitor investment activity through a single dashboard experience.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
                    <Link href="/terms" className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-slate-300 hover:bg-slate-100">
                      Terms of Use
                    </Link>
                    <Link href="/privacy" className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-slate-300 hover:bg-slate-100">
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
       <Tutorial />
      <MobileAppInstallSection />
    </main>
  );
}
