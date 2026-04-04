export const metadata = {
  title: "Privacy Policy | InvestAir",
  description: "Understand the types of account, wallet, and usage information InvestAir may process to operate the platform.",
};

const sections = [
  {
    title: "Information we collect",
    body:
      "InvestAir may collect account details such as email address, encrypted authentication credentials, wallet information, transaction records, withdrawal requests, chat interactions, and technical usage data needed to operate and secure the platform.",
  },
  {
    title: "How information is used",
    body:
      "Collected information may be used to create and maintain investor accounts, provision wallets, process platform activity, personalize dashboard content, provide support, improve product performance, and protect the platform from abuse or security threats.",
  },
  {
    title: "Chat and support data",
    body:
      "If you use the chatbot or support features, the messages, screenshots, and related interaction data may be processed to help answer questions, troubleshoot issues, and improve the quality of support experiences.",
  },
  {
    title: "Wallet and transaction records",
    body:
      "Because the platform supports wallet-linked funding and related activity, transaction metadata and address information may be stored or processed to reconcile balances, monitor deposits, support withdrawals, and maintain auditability.",
  },
  {
    title: "Data sharing",
    body:
      "InvestAir may share information with service providers, infrastructure partners, analytics tools, security providers, or legal authorities where reasonably necessary to operate the platform, protect users, comply with obligations, or investigate misuse.",
  },
  {
    title: "Data retention and security",
    body:
      "Information may be retained for operational, legal, accounting, fraud-prevention, and support purposes. InvestAir applies reasonable administrative and technical safeguards, but no online system can promise absolute security.",
  },
  {
    title: "Your choices",
    body:
      "You may request help with account access, profile updates, or general privacy questions through official platform support channels. Additional rights may depend on your location and applicable law.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fffafc_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Privacy Policy</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">How InvestAir handles platform and account data.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          This policy provides a general overview of the types of information the platform may process in order to operate investor accounts, wallet functionality, support experiences, and security controls.
        </p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}