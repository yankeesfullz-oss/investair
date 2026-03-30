import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import { parseInvestmentPrice } from "@/lib/investmentPropertyUtils";

function formatAnnualizedValue(monthlyPrice) {
  const annualValue = parseInvestmentPrice(monthlyPrice) * 12;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(annualValue);
}

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function InvestmentPropertyCard({ property, highlighted = false, months }) {
  const detailHref = months
    ? `/invest/${property.id}?months=${months}`
    : `/invest/${property.id}`;
  const propertyImages = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : [property.image].filter(Boolean);
  const bedLabel = property.beds || "Bed info on listing";
  const bathLabel = property.baths || "Bath info on listing";
  const durationLabel = Array.isArray(property.allowedDurations) && property.allowedDurations.length > 0
    ? `${property.allowedDurations.join(" / ")} mo`
    : "Flexible";

  return (
    <article
      className={`overflow-hidden rounded-[2rem] border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlighted ? "border-rose-200 ring-1 ring-rose-100" : "border-white/70"
      }`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
        <Image
          src={propertyImages[0]}
          alt={property.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm">
          {property.investmentPricePerMonth}
        </div>
        {propertyImages.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            {propertyImages.length} photos
          </div>
        )}
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">{property.state} investment</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{property.name}</h2>
              <p className="mt-2 text-sm font-medium text-rose-600">{property.investorHeadline}</p>
            </div>
            {highlighted && (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                Search match
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={16} className="text-rose-500" />
            <span>{property.address}</span>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600">{property.investorSummary || property.summary}</p>

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Daily payout</p>
            <p className="mt-1 font-semibold text-slate-950">{formatUsd(property.currentDailyPayoutAmount || 0)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Projected annualized</p>
            <p className="mt-1 font-semibold text-slate-950">{formatAnnualizedValue(property.investmentPricePerMonth)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-100 p-4 text-sm text-slate-700">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Funded</p>
            <p className="mt-1 font-semibold text-slate-950">{property.fundedPercentage}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Occupancy</p>
            <p className="mt-1 font-semibold text-slate-950">{property.occupancyScore}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Terms</p>
            <p className="mt-1 font-semibold text-slate-950">{months ? `${months} mo` : durationLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <BedDouble size={16} />
            {bedLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <Bath size={16} />
            {bathLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
            <TrendingUp size={16} />
            {property.totalInvestors} investors
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
            <ShieldCheck size={16} />
            {property.riskLevel} risk
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={detailHref}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            View details
          </Link>
          {property.sourceUrl ? (
            <Link
              href={property.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Open source listing
              <ArrowUpRight size={16} />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}