import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  CalendarRange,
  CarFront,
  Dumbbell,
  FileImage,
  Home,
  Landmark,
  MapPin,
  PawPrint,
  Phone,
  PlayCircle,
  ShieldCheck,
  Waves,
  Wind,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getInvestmentPropertyById, parseInvestmentPrice } from "@/lib/investmentProperties";
import PropertyImageCarousel from "@/components/Public/propertyImageCarousel";

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getAmenityIcon(amenity) {
  const value = String(amenity || "").toLowerCase();

  if (/garage|parking|carport/i.test(value)) {
    return CarFront;
  }

  if (/pool|waterfront|bay|beach|water/i.test(value)) {
    return Waves;
  }

  if (/gym|fitness/i.test(value)) {
    return Dumbbell;
  }

  if (/air|cooling|ventilation/i.test(value)) {
    return Wind;
  }

  if (/security|controlled|gated|intercom/i.test(value)) {
    return ShieldCheck;
  }

  return Home;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const property = getInvestmentPropertyById(resolvedParams.id);

  if (!property) {
    return {
      title: "Investment Property Not Found | Investair",
    };
  }

  return {
    title: `${property.name} | Investair`,
    description: `${property.name} in ${property.city}, ${property.state} with monthly investment pricing from ${property.investmentPricePerMonth}.`,
  };
}

export default async function InvestmentPropertyDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const property = getInvestmentPropertyById(resolvedParams.id);

  if (!property) {
    notFound();
  }

  const months = resolvedSearchParams?.months;
  const monthlyPrice = parseInvestmentPrice(property.investmentPricePerMonth);
  const annualizedPrice = monthlyPrice * 12;
  const selectedDurationTotal = months ? monthlyPrice * Number(months) : null;
  const propertyImages = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : [property.image].filter(Boolean);
  const amenityList = Array.isArray(property.amenities) ? property.amenities.slice(0, 12) : [];
  const petList = Array.isArray(property.pets) ? property.pets : [];
  const tourList = Array.isArray(property.virtualTours) ? property.virtualTours : [];
  const floorPlans = Array.isArray(property.floorPlans) ? property.floorPlans : [];
  const investHref = months
    ? `/investor/signup?property=${property.id}&months=${months}`
    : `/investor/signup?property=${property.id}`;
  const selectedDuration = months ? Number(months) : null;
  const projectedSelectedPayout = selectedDuration ? property.currentDailyPayoutAmount * 30 * selectedDuration : null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_25%,#f8fafc_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-8">
        <Link
          href={months ? `/invest?property=${property.id}&months=${months}` : "/invest"}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to investments
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <PropertyImageCarousel images={propertyImages} propertyName={property.name} />

            <div className="space-y-6 p-6 sm:p-8">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                    {property.state} investment property
                  </p>
                  <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {property.source}
                  </p>
                  <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {property.listingType}
                  </p>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{property.name}</h1>
                <p className="max-w-3xl text-lg font-medium text-rose-600">{property.investorHeadline}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} className="text-rose-500" />
                    {property.address}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BedDouble size={16} className="text-rose-500" />
                    {property.beds}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Bath size={16} className="text-rose-500" />
                    {property.baths}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">{property.investorSummary || property.summary}</p>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{property.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-[1.75rem] bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Daily payout</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{formatUsd(property.currentDailyPayoutAmount || 0)}</p>
                </div>
                <div className="rounded-[1.75rem] bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Monthly slot price</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{property.investmentPricePerMonth}</p>
                </div>
                <div className="rounded-[1.75rem] bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Occupancy score</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{property.occupancyScore}%</p>
                </div>
                <div className="rounded-[1.75rem] bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Funded</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{property.fundedPercentage}%</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4 rounded-[2rem] border border-rose-100 bg-rose-50/50 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Investor highlights</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {(property.highlights || []).map((highlight) => (
                        <div key={highlight} className="rounded-2xl bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Demand score</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{property.demandScore}%</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Risk level</p>
                      <p className="mt-2 text-lg font-semibold capitalize text-slate-950">{property.riskLevel}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Investors live</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{property.totalInvestors}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Trust and operating posture</p>
                  <div className="flex flex-wrap gap-2">
                    {(property.trustBadges || []).map((badge) => (
                      <span key={badge} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Allowed durations</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">{property.allowedDurations.join(', ')} months</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Availability window</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">{property.availabilityWindowLabel || property.availability}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Projected monthly payout</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">{formatUsd(property.projectedMonthlyPayoutAmount || 0)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Annualized value</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">{formatUsd(annualizedPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4 rounded-[2rem] border border-slate-100 bg-slate-50/70 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Property essentials</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Availability</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{property.availability}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Manager</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{property.manager}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Phone</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{property.phone || "Use source listing"}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Source ID</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{property.propertyId}</p>
                      </div>
                    </div>
                  </div>

                  {amenityList.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">What stands out</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {amenityList.map((amenity) => {
                          const Icon = getAmenityIcon(amenity);

                          return (
                            <div key={amenity} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                                <Icon size={18} />
                              </span>
                              <p className="text-sm leading-6 text-slate-700">{amenity}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Extra context</p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <Building2 size={18} className="mt-0.5 text-rose-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Listing format</p>
                        <p className="mt-1 text-sm text-slate-600">{property.listingType}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <Phone size={18} className="mt-0.5 text-rose-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Best next step</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {property.phone
                            ? `Reach the listing team at ${property.phone} or continue with your Investair flow.`
                            : "Open the source listing for the most current contact details, then continue with your Investair flow."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <CalendarRange size={18} className="mt-0.5 text-rose-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Inventory posture</p>
                        <p className="mt-1 text-sm text-slate-600">{property.availability}</p>
                      </div>
                    </div>
                  </div>

                  {petList.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <PawPrint size={16} className="text-rose-500" />
                        Pet policy
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {petList.map((pet) => (
                          <span key={pet} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                            {pet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(tourList.length > 0 || floorPlans.length > 0) && (
                    <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
                      <p className="text-sm font-semibold text-slate-950">See it before you commit</p>

                      {tourList.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Virtual tours</p>
                          <div className="grid gap-2">
                            {tourList.map((tourLink, index) => (
                              <Link
                                key={`${tourLink}-${index}`}
                                href={tourLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <PlayCircle size={16} className="text-rose-500" />
                                  Virtual tour {index + 1}
                                </span>
                                <ArrowUpRight size={16} />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {floorPlans.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Floor plans</p>
                          <div className="grid gap-2">
                            {floorPlans.map((floorPlanLink, index) => (
                              <Link
                                key={`${floorPlanLink}-${index}`}
                                href={floorPlanLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <FileImage size={16} className="text-rose-500" />
                                  Floor plan {index + 1}
                                </span>
                                <ArrowUpRight size={16} />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2.25rem] border border-rose-100 bg-[linear-gradient(180deg,#fff1f2_0%,#ffffff_100%)] p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Investment summary</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-rose-100 pb-4">
                  <div>
                    <p className="text-sm text-slate-500">Monthly slot price</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">{property.investmentPricePerMonth}</p>
                  </div>
                  <Landmark className="text-rose-500" />
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-rose-100 pb-4">
                  <div>
                    <p className="text-sm text-slate-500">Suggested duration</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">{months ? `${months} months` : `${property.minimumInvestmentMonths}+ months`}</p>
                  </div>
                  <CalendarRange className="text-rose-500" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Projected payout position</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                      {projectedSelectedPayout ? formatUsd(projectedSelectedPayout) : formatUsd(property.projectedMonthlyPayoutAmount || monthlyPrice)}
                    </p>
                  </div>
                  <Building2 className="text-rose-500" />
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href={investHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
                >
                  Invest now
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  href={property.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Open source listing
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  href="/invest"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Browse all investments
                </Link>
              </div>
            </div>

            <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Decision support</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>This page now leads with the investable product: daily payout posture, duration ladder, funding momentum, and the trust markers an investor needs before entering a slot.</p>
                <p>The underlying listing context is still preserved below, but the top of the experience is now aligned with how InvestAir actually sells rental-income access.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}