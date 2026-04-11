import Link from "next/link";

export const metadata = {
  title: "Disclaimer | InvestAir",
  description: "Important general information about InvestAir content, platform materials, and support communications.",
};

const disclaimerItems = [
  "InvestAir content, dashboards, chatbot interactions, and support communications are provided for general informational purposes only and are not legal, tax, accounting, or individualized investment advice.",
  "Projected returns, payout illustrations, occupancy assumptions, and property performance references may change over time and are not guarantees of future results.",
  "Users are responsible for reviewing opportunity details, understanding risk, and obtaining independent professional advice where appropriate before making financial decisions.",
  "Platform availability, support responsiveness, and informational content may change without notice as InvestAir updates features, workflows, and operational practices.",
];

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffafc_0%,#ffffff_40%,#f8fafc_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-[2.5rem] border border-white/80 bg-white/90 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
          Disclaimer
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">General platform and communication disclaimer</h1>
        <div className="mt-8 space-y-4 text-sm leading-8 text-slate-600 sm:text-base">
          {disclaimerItems.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact-us" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Contact support
          </Link>
          <Link href="/terms" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            Review terms
          </Link>
        </div>
      </section>
    </main>
  );
}