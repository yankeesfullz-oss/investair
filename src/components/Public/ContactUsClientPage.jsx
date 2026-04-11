"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { openTawkSupport } from "@/lib/tawk";

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/disclaimer", label: "Disclaimer" },
];

const contactDetails = [
  {
    label: "Email",
    value: "support@investair.online",
    href: "mailto:support@investair.online",
  },
  {
    label: "Phone",
    value: "+1 (850) 669-6798",
    href: "tel:+18506696798",
  },
  {
    label: "Headquarters",
    value: "887 Brannan Street, San Francisco, CA 94109, USA",
  },
];

const defaultForm = {
  name: "",
  phone: "",
  email: "",
  message: "",
};

export default function ContactUsClientPage() {
  const auth = useAuth();
  const user = auth?.user || null;
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedSnapshot, setSubmittedSnapshot] = useState(null);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || user?.fullName || "",
      email: current.email || user?.email || "",
      phone: current.phone || user?.phone || "",
    }));
  }, [user]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };

    if (!trimmed.name || !trimmed.phone || !trimmed.email || !trimmed.message) {
      setError("Please complete your name, phone number, email, and message.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await openTawkSupport({
        user: { fullName: trimmed.name, email: trimmed.email },
        phone: trimmed.phone,
        contactRequest: trimmed,
      });
      setSubmittedSnapshot(trimmed);
      setForm(defaultForm);
    } catch (requestError) {
      setError(requestError.message || "Unable to open live chat right now.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReopenSupport() {
    if (!submittedSnapshot) return;
    setError("");
    try {
      await openTawkSupport({
        user: { fullName: submittedSnapshot.name, email: submittedSnapshot.email },
        phone: submittedSnapshot.phone,
        contactRequest: submittedSnapshot,
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to open live chat right now.");
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.12),_transparent_30%),linear-gradient(180deg,#fff8fb_0%,#ffffff_38%,#f8fafc_100%)] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-12">
        
        {/* 1. FORM SECTION (FIRST) */}
        <section className="rounded-[2.5rem] border border-white/80 bg-white/90 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-12">
          <div className="mb-10">
            <p className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
              {submittedSnapshot ? "Request Received" : "Contact Support"}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {submittedSnapshot ? "We've got your request!" : "Get in touch with InvestAir."}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {submittedSnapshot 
                ? "Your details have been recorded. You can now engage directly with our team via the live chat widget." 
                : "Fill out the form below and we will launch the live chat widget with your context attached for instant support."}
            </p>
          </div>

          {submittedSnapshot ? (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/50 p-6 sm:p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4 text-sm leading-7 text-slate-700">
                    <p><span className="font-semibold text-slate-950">Name:</span> {submittedSnapshot.name}</p>
                    <p><span className="font-semibold text-slate-950">Phone:</span> {submittedSnapshot.phone}</p>
                    <p><span className="font-semibold text-slate-950">Email:</span> {submittedSnapshot.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-950">Message Preview:</p>
                    <p className="rounded-2xl bg-white/80 px-4 py-3 text-sm italic text-slate-600 border border-emerald-100">
                      "{submittedSnapshot.message}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleReopenSupport}
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open Live Chat
                </button>
                <button
                  onClick={() => { setSubmittedSnapshot(null); setError(""); }}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Send Another Request
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Full name</span>
                  <input
                    name="name" type="text" value={form.name} onChange={updateField}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    placeholder="Your full name"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Phone number</span>
                  <input
                    name="phone" type="tel" value={form.phone} onChange={updateField}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    placeholder="+1 (555) 000-0000"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email address</span>
                <input
                  name="email" type="email" value={form.email} onChange={updateField}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Message</span>
                <textarea
                  name="message" rows={5} value={form.message} onChange={updateField}
                  className="mt-2 w-full rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  placeholder="Tell us what you need help with."
                />
              </label>
              {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
              <button
                type="submit" disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
              >
                {submitting ? "Opening live chat..." : "Launch Live Support"}
              </button>
            </form>
          )}
        </section>

        {/* 2. CONTACT INFO SECTION (SECOND) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contactDetails.map((item) => (
            <div 
              key={item.label} 
              className="rounded-[2rem] border border-white/80 bg-white/60 p-7 shadow-sm backdrop-blur-sm transition hover:border-rose-200"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {item.label}
              </p>
              {item.href ? (
                <a 
                  href={item.href} 
                  className="mt-4 block text-base font-medium leading-7 text-slate-900 transition hover:text-rose-600"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-4 text-sm leading-7 text-slate-900">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* 3. LEGAL SECTION (LAST) */}
        <aside className="rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_20px_80px_rgba(15,23,42,0.12)] sm:p-12">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-300">Corporate Identity</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">InvestAir.online</h2>
                <p className="mt-2 text-sm text-slate-400">© 2026 InvestAir.online | Global Property Management</p>
              </div>
              
              <div className="grid gap-8 sm:grid-cols-2">
                <div className="text-sm leading-7 text-slate-300">
                  <p className="font-semibold text-white">Registration</p>
                  <p>Delaware, United States</p>
                  <p className="text-xs text-slate-500">LEI: 549300GX5CPIZQ5PDX31</p>
                </div>
                <div className="text-sm leading-7 text-slate-300">
                  <p className="font-semibold text-white">Registered Office</p>
                  <p>C/O Corporation Service Company</p>
                  <p>254 Little Falls Drive, Wilmington, DE 19808</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:border-rose-300 hover:text-rose-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </section>
    </main>
  );
}