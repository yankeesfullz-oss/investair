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
  PlayCircle,
  ShieldCheck,
  Waves,
  Wind,
} from "lucide-react";
import { notFound, permanentRedirect } from "next/navigation";
import { getInvestmentProperties, matchInvestmentProperty, parseInvestmentPrice } from "@/lib/investmentProperties";
import PropertyImageCarousel from "@/components/Public/propertyImageCarousel";
import InvestmentCheckoutCard from "@/components/Public/InvestmentCheckoutCard";
import {
  absoluteUrl,
  getCanonicalPropertySegment,
  getPropertyPath,
  getSiteUrl,
} from "@/lib/site";

export const revalidate = 3600;

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

function buildSearchParamsQuery(searchParams) {
  const queryEntries = Object.entries(searchParams || {}).flatMap(([key, value]) => {
    if (value == null || value === "") {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map((entry) => [key, String(entry)]);
    }

    return [[key, String(value)]];
  });

  return new URLSearchParams(queryEntries).toString();
}

function buildPropertyMetadata(property) {
  const canonicalPath = getPropertyPath(property);
  const canonicalUrl = absoluteUrl(canonicalPath);
  const imageUrl = Array.isArray(property.images) && property.images.length > 0
    ? property.images[0]
    : property.image || property.coverImage || "";
  const propertyAddress = property.address || [property.addressLine1, property.city, property.state].filter(Boolean).join(", ");
  const monthlyEntry = property.investmentPricePerMonth || "$0";
  const occupancy = Number(property.occupancyScore || 0);

  return {
    canonicalPath,
    canonicalUrl,
    propertyAddress,
    imageUrl,
    title: `${property.name} Investment Opportunity at ${propertyAddress || `${property.city}, ${property.state}`}`,
    description: `${propertyAddress || `${property.city}, ${property.state}`}. Explore this InvestAir property opportunity with monthly entry from ${monthlyEntry}, projected occupancy around ${occupancy}%, and performance-based short-stay investment positioning.`,
  };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const properties = await getInvestmentProperties();
  const property = matchInvestmentProperty(properties, resolvedParams.id);

  if (!property) {
    return {
      title: "Property Not Found",
      description: "The requested investment property or apartment for rent could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const seo = buildPropertyMetadata(property);

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonicalPath,
    },
    robots: {
      index: true,
      follow: true,
    },
    keywords: [property.city, property.state, property.address, "short-term rental investment", "investment property", property.name].filter(Boolean),
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonicalUrl,
      images: seo.imageUrl ? [{ url: absoluteUrl(seo.imageUrl), alt: property.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.imageUrl ? [absoluteUrl(seo.imageUrl)] : [],
    },
  };
}

export default async function InvestmentPropertyDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const properties = await getInvestmentProperties();
  const property = matchInvestmentProperty(properties, resolvedParams.id);

  if (!property) {
    notFound();
  }

  const canonicalSegment = getCanonicalPropertySegment(property);
  const canonicalPath = getPropertyPath(property);
  const queryString = buildSearchParamsQuery(resolvedSearchParams);

  if (canonicalSegment && resolvedParams.id !== canonicalSegment) {
    permanentRedirect(queryString ? `${canonicalPath}?${queryString}` : canonicalPath);
  }

  const months = resolvedSearchParams?.months;
  const monthlyPrice = parseInvestmentPrice(property.investmentPricePerMonth);
  const annualizedPrice = monthlyPrice * 12;
  const propertyImages = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : [property.image].filter(Boolean);
  const amenityList = Array.isArray(property.amenities) ? property.amenities.slice(0, 12) : [];
  const petList = Array.isArray(property.pets) ? property.pets : [];
  const tourList = Array.isArray(property.virtualTours) ? property.virtualTours : [];
  const floorPlans = Array.isArray(property.floorPlans) ? property.floorPlans : [];
  const selectedDuration = months ? Number(months) : null;
  const projectedSelectedPayout = selectedDuration ? property.currentDailyPayoutAmount * 30 * selectedDuration : null;
  const propertyAddress = property.address || [property.addressLine1, property.city, property.state].filter(Boolean).join(", ");
  const canonicalUrl = absoluteUrl(canonicalPath);
  const propertyStructuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.name,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    description: property.investorSummary || property.summary || property.description,
    image: propertyImages.map((image) => absoluteUrl(image)),
    dateModified: property.updatedAt || property.scrapedAt || undefined,
    provider: {
      "@type": "Organization",
      name: "InvestAir",
      url: getSiteUrl(),
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.addressLine1 || propertyAddress,
      addressLocality: property.city || undefined,
      addressRegion: property.state || undefined,
      postalCode: property.zip || property.postalCode || undefined,
      addressCountry: property.country || "US",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: monthlyPrice,
      url: canonicalUrl,
      availability: String(property.availability || "").toLowerCase().includes("sold")
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Occupancy score",
        value: `${property.occupancyScore || 0}%`,
      },
      {
        "@type": "PropertyValue",
        name: "Allowed durations",
        value: Array.isArray(property.allowedDurations) ? property.allowedDurations.join(", ") : "",
      },
      {
        "@type": "PropertyValue",
        name: "Investment entry price",
        value: property.investmentPricePerMonth,
      },
    ],
  };
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Invest",
        item: absoluteUrl("/invest"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_25%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-10 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbStructuredData, propertyStructuredData]) }}
      />
      <section className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
        <Link
          href={months ? `/invest?property=${property.id}&months=${months}` : "/invest"}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to investments
        </Link>

        {/* 12-Column Layout for seamless responsive scaling */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-7 xl:col-span-8 overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <PropertyImageCarousel images={propertyImages} propertyName={property.name} />

            <div className="space-y-6 sm:space-y-8 p-5 sm:p-8">
              {/* Header Info */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                    {property.state} investment property
                  </p>
                  <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {property.source}
                  </p>
                  <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {property.listingType}
                  </p>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl lg:text-5xl">{property.name}</h1>
                <p className="max-w-3xl text-base sm:text-lg font-medium text-rose-600">{property.investorHeadline}</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <MapPin size={16} className="text-rose-500 shrink-0" />
                    <span className="truncate max-w-50 sm:max-w-none">{property.address}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <BedDouble size={16} className="text-rose-500 shrink-0" />
                    {property.beds}
                  </span>
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <Bath size={16} className="text-rose-500 shrink-0" />
                    {property.baths}
                  </span>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <p className="max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">{property.investorSummary || property.summary}</p>
                <p className="max-w-3xl text-sm leading-6 sm:leading-7 text-slate-600 sm:text-base">{property.description}</p>
              </div>

              {/* Core Stats (2x2 on Mobile/Tab, 4x1 on Desktop) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <div className="rounded-2xl sm:rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Daily payout</p>
                  <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-slate-950">{formatUsd(property.currentDailyPayoutAmount || 0)}</p>
                </div>
                <div className="rounded-2xl sm:rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Monthly slot</p>
                  <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-slate-950">{property.investmentPricePerMonth}</p>
                </div>
                <div className="rounded-2xl sm:rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Occupancy</p>
                  <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-slate-950">{property.occupancyScore}%</p>
                </div>
                <div className="rounded-2xl sm:rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Funded</p>
                  <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-slate-950">{property.fundedPercentage}%</p>
                </div>
              </div>

              {/* Secondary Layout Splits (1 Col Mobile, 2 Col Tab/Desktop) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="space-y-4 rounded-[1.5rem] sm:rounded-[2rem] border border-rose-100 bg-rose-50/50 p-4 sm:p-5">
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Investor highlights</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(property.highlights || []).map((highlight) => (
                        <div key={highlight} className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 text-sm font-medium text-slate-700 shadow-sm">
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Demand</p>
                      <p className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-slate-950">{property.demandScore}%</p>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Risk</p>
                      <p className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold capitalize text-slate-950">{property.riskLevel}</p>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Investors</p>
                      <p className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-slate-950">{property.totalInvestors}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Trust and operating posture</p>
                  <div className="flex flex-wrap gap-2">
                    {(property.trustBadges || []).map((badge) => (
                      <span key={badge} className="rounded-full bg-slate-100 px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Allowed durations</p>
                      <p className="mt-1 sm:mt-2 text-sm font-semibold text-slate-950">{property.allowedDurations.join(', ')} months</p>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Availability window</p>
                      <p className="mt-1 sm:mt-2 text-sm font-semibold text-slate-950">{property.availabilityWindowLabel || property.availability}</p>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Projected payout</p>
                      <p className="mt-1 sm:mt-2 text-sm font-semibold text-slate-950">{formatUsd(property.projectedMonthlyPayoutAmount || 0)}</p>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Annualized value</p>
                      <p className="mt-1 sm:mt-2 text-sm font-semibold text-slate-950">{formatUsd(annualizedPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tertiary Layout Splits */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="space-y-4 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Property essentials</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Availability</p>
                        <p className="mt-1 sm:mt-2 text-sm font-semibold text-slate-950">{property.availability}</p>
                      </div>
                      <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Manager</p>
                        <p className="mt-1 sm:mt-2 text-sm font-semibold text-slate-950">{property.manager}</p>
                      </div>
                      <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Source ID</p>
                        <p className="mt-1 sm:mt-2 text-sm font-semibold text-slate-950">{property.propertyId}</p>
                      </div>
                    </div>
                  </div>

                  {amenityList.length > 0 && (
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">What stands out</p>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {amenityList.map((amenity) => {
                          const Icon = getAmenityIcon(amenity);
                          return (
                            <div key={amenity} className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
                              <span className="mt-0.5 inline-flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-50 text-rose-500">
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

                <div className="space-y-4 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Extra context</p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <Building2 size={18} className="mt-0.5 text-rose-500 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Listing format</p>
                        <p className="mt-1 text-sm text-slate-600">{property.listingType}</p>
                      </div>
                    </div>

                    {property.sourceUrl ? (
                      <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                        <ArrowUpRight size={18} className="mt-0.5 text-rose-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Best next step</p>
                          <p className="mt-1 text-sm text-slate-600">Review the listing details, then sign up or sign in to Investair to get started.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                        <ArrowUpRight size={18} className="mt-0.5 text-rose-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Best next step</p>
                          <p className="mt-1 text-sm text-slate-600">Sign up or sign in to Investair to get started with this property.</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <CalendarRange size={18} className="mt-0.5 text-rose-500 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Inventory posture</p>
                        <p className="mt-1 text-sm text-slate-600">{property.availability}</p>
                      </div>
                    </div>
                  </div>

                  {petList.length > 0 && (
                    <div className="rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-4">
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
                    <div className="space-y-3 rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-4">
                      <p className="text-sm font-semibold text-slate-950">See it before you commit</p>

                      {tourList.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Virtual tours</p>
                          <div className="grid gap-2">
                            {tourList.map((tourLink, index) => (
                              <Link
                                key={`${tourLink}-${index}`}
                                href={tourLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-between rounded-xl sm:rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <PlayCircle size={16} className="text-rose-500 shrink-0" />
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
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400">Floor plans</p>
                          <div className="grid gap-2">
                            {floorPlans.map((floorPlanLink, index) => (
                              <Link
                                key={`${floorPlanLink}-${index}`}
                                href={floorPlanLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-between rounded-xl sm:rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <FileImage size={16} className="text-rose-500 shrink-0" />
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

          {/* Sidebar */}
          <aside className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Sticky behavior optional: add 'sticky top-8' to parent if you want it to scroll cleanly on desktop */}
            <div className="rounded-3xl sm:rounded-[2.25rem] border border-rose-100 bg-[linear-gradient(180deg,#fff1f2_0%,#ffffff_100%)] p-5 sm:p-8 shadow-sm">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Investment summary</p>
              <div className="mt-4 sm:mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-rose-100 pb-4">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">Monthly slot price</p>
                    <p className="mt-1 text-xl sm:text-2xl font-semibold text-slate-950">{property.investmentPricePerMonth}</p>
                  </div>
                  <Landmark className="text-rose-500 shrink-0 mt-1" />
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-rose-100 pb-4">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">Suggested duration</p>
                    <p className="mt-1 text-xl sm:text-2xl font-semibold text-slate-950">{months ? `${months} months` : `${property.minimumInvestmentMonths}+ months`}</p>
                  </div>
                  <CalendarRange className="text-rose-500 shrink-0 mt-1" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">Projected payout position</p>
                    <p className="mt-1 text-xl sm:text-2xl font-semibold text-slate-950">
                      {projectedSelectedPayout ? formatUsd(projectedSelectedPayout) : formatUsd(property.projectedMonthlyPayoutAmount || monthlyPrice)}
                    </p>
                  </div>
                  <Building2 className="text-rose-500 shrink-0 mt-1" />
                </div>
              </div>

              <div className="mt-6 sm:mt-8 space-y-3">
                <InvestmentCheckoutCard property={property} monthlyPrice={monthlyPrice} initialMonths={selectedDuration} />
                {property.sourceUrl ? (
                  <Link
                    href={property.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Open source listing
                    <ArrowUpRight size={16} />
                  </Link>
                ) : null}
                <Link
                  href="/invest"
                  className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Browse all investments
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}