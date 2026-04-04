export const metadata = {
  title: "Terms of Use | InvestAir",
  description: "Review the core terms governing access to the InvestAir platform, investor accounts, wallet funding, and platform use.",
};

const sections = [
  {
    title: "Platform scope",
    body:
      "InvestAir provides a digital platform for discovering property opportunities, creating investor accounts, funding supported wallets, reserving structured investment periods, and tracking account activity. Platform content is provided for informational and operational use within the service.",
  },
  {
    title: "Eligibility and account responsibility",
    body:
      "You are responsible for maintaining the confidentiality of your account credentials and for activity that occurs under your account. You agree to provide accurate information when registering and using the platform.",
  },
  {
    title: "No guaranteed returns",
    body:
      "Projected revenue, occupancy, performance metrics, and payout illustrations are estimates only unless expressly stated otherwise in a formal written agreement. Actual outcomes can vary based on booking activity, seasonality, pricing, property conditions, operating costs, and other market factors.",
  },
  {
    title: "Funding and withdrawals",
    body:
      "Funding and withdrawal activity may depend on supported wallet infrastructure, blockchain confirmation timing, internal review, and platform availability. InvestAir does not guarantee immediate settlement, continuous network availability, or uninterrupted processing times.",
  },
  {
    title: "Acceptable use",
    body:
      "You agree not to misuse the platform, interfere with platform operations, attempt unauthorized access, submit fraudulent information, or use the service for unlawful activity. InvestAir may suspend or restrict access where misuse, abuse, or security concerns are detected.",
  },
  {
    title: "Informational content only",
    body:
      "Platform copy, chatbot assistance, dashboards, and support content are intended to help users navigate the service. They do not constitute legal, tax, accounting, or individualized financial advice.",
  },
  {
    title: "Service changes",
    body:
      "InvestAir may update platform features, property availability, supported durations, wallet flows, pricing information, and these Terms from time to time. Continued use of the platform after updates constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-[2.5rem] border border-slate-100 bg-slate-50 p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Terms of Use</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Core terms for using the InvestAir platform.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          These terms provide a general framework for platform use, investor accounts, operational content, and wallet-linked funding activity. They should be reviewed alongside any additional agreements, disclosures, or onboarding documents that apply to a specific opportunity.
        </p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[1.75rem] border border-white bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}