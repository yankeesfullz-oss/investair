import Link from "next/link";
import BoardOfDirectorsSection from "@/components/Public/BoardOfDirectorsSection";

export const metadata = {
  title: "About InvestAir",
  description:
    "Learn how InvestAir structures access to short-term rental cashflow through guest-ready properties, duration-based investment windows, and modern investor tooling.",
};

const pillars = [
  {
    title: "Short-stay focus",
    description:
      "InvestAir is built around the economics of guest-ready apartments, vacation-ready homes, and other properties designed for short-duration stays.",
  },
  {
    title: "Time-based participation",
    description:
      "Instead of requiring full property ownership, the platform centers on reserving defined rental-income periods tied to a specific property and duration.",
  },
  {
    title: "Operational simplicity",
    description:
      "The model is designed for people who want exposure to rental performance without personally running guest communications, cleaning, furnishing, or daily operations.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffafc_0%,#ffffff_35%,#f8fafc_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2.5rem] border border-white/80 bg-white/90 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
            About InvestAir
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            InvestAir is a short-term rental investment platform built around structured access to rental cashflow.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            Founded in 2024, InvestAir was created for investors who want exposure to the short-stay economy without having to source properties, manage guests, coordinate cleaning, or run daily hospitality operations themselves.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            The platform focuses on guest-ready properties and rental-income periods. Investors can review opportunities, choose a supported duration, fund their account, and participate in rental performance through a more structured digital experience.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.description}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] border border-slate-100 bg-slate-950 p-8 text-white shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">Mission</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              To make short-term rental cashflow more accessible, understandable, and operationally simpler for modern investors.
            </p>
            <h2 className="mt-8 text-2xl font-semibold tracking-tight">Vision</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              To become a leading platform for structured participation in the short-stay investment economy through transparent, technology-enabled access to rental performance.
            </p>
          </article>

          <article className="rounded-[2rem] border border-slate-100 bg-slate-50 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">What makes the model different</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Traditional real estate often centers on property acquisition and direct management. InvestAir instead emphasizes cashflow participation over defined periods, supported by platform infrastructure, investor dashboards, and modern funding rails.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Performance remains projected and variable. Returns can move with occupancy, guest demand, seasonality, local pricing conditions, and operating execution.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/invest" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                View opportunities
              </Link>
              <Link href="/privacy" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                Privacy Policy
              </Link>
            </div>
          </article>
        </div>

        <BoardOfDirectorsSection />
      </section>
    </main>
  );
}