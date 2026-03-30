"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const initialState = {
  name: "",
  location: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
  market: "",
  propertyType: "",
  listingType: "",
  investorHeadline: "",
  investorSummary: "",
  description: "",
  highlights: "",
  trustBadges: "",
  tags: "",
  beds: "",
  baths: "",
  sqft: "",
  yearBuilt: "",
  totalValue: "",
  targetRaiseAmount: "",
  expectedAnnualYield: "",
  totalSlots: "",
  fundedSlots: "",
  slotBasePriceMonthly: "",
  currentDailyPayoutAmount: "",
  projectedMonthlyPayoutAmount: "",
  projectedAnnualPayoutAmount: "",
  minimumInvestmentMonths: "2",
  maximumInvestmentMonths: "",
  allowedDurations: "2,3,6,12",
  fundedPercentage: "",
  totalInvestors: "",
  occupancyScore: "",
  demandScore: "",
  availabilityWindowLabel: "",
  riskLevel: "moderate",
  payoutCurrency: "USDT",
  status: "active",
  investmentStatus: "active",
  isPublished: "false",
  featured: "false",
  verified: "false",
  sourceName: "InvestAir",
  sourceUrl: "",
  sourceListingId: "",
  coverImage: "",
  images: "",
};

function serializeList(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return "";
  }

  return values.join("\n");
}

function parseList(value) {
  return String(value || "")
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function serializeImageList(images) {
  return serializeList(images);
}

function parseImageList(value) {
  return parseList(value);
}

function toFormState(property) {
  if (!property) {
    return initialState;
  }

  return {
    name: property.name || "",
    location: property.location || "",
    addressLine1: property.addressLine1 || "",
    city: property.city || "",
    state: property.state || "",
    postalCode: property.postalCode || property.zip || "",
    country: property.country || "United States",
    market: property.market || "",
    propertyType: property.propertyType || "",
    listingType: property.listingType || "",
    investorHeadline: property.investorHeadline || "",
    investorSummary: property.investorSummary || "",
    description: property.description || "",
    highlights: serializeList(property.highlights),
    trustBadges: serializeList(property.trustBadges),
    tags: serializeList(property.tags),
    beds: String(property.beds ?? ""),
    baths: String(property.baths ?? ""),
    sqft: String(property.sqft ?? ""),
    yearBuilt: String(property.yearBuilt ?? ""),
    totalValue: String(property.totalValue || ""),
    targetRaiseAmount: String(property.targetRaiseAmount || ""),
    expectedAnnualYield: String(property.expectedAnnualYield || ""),
    totalSlots: String(property.totalSlots || ""),
    fundedSlots: String(property.fundedSlots || ""),
    slotBasePriceMonthly: String(property.slotBasePriceMonthly || ""),
    currentDailyPayoutAmount: String(property.currentDailyPayoutAmount || ""),
    projectedMonthlyPayoutAmount: String(property.projectedMonthlyPayoutAmount || ""),
    projectedAnnualPayoutAmount: String(property.projectedAnnualPayoutAmount || ""),
    minimumInvestmentMonths: String(property.minimumInvestmentMonths || 2),
    maximumInvestmentMonths: String(property.maximumInvestmentMonths || ""),
    allowedDurations: Array.isArray(property.allowedDurations) ? property.allowedDurations.join(",") : "2,3,6,12",
    fundedPercentage: String(property.fundedPercentage || ""),
    totalInvestors: String(property.totalInvestors || ""),
    occupancyScore: String(property.occupancyScore || ""),
    demandScore: String(property.demandScore || ""),
    availabilityWindowLabel: property.availabilityWindowLabel || "",
    riskLevel: property.riskLevel || "moderate",
    payoutCurrency: property.payoutCurrency || "USDT",
    status: property.status || "active",
    investmentStatus: property.investmentStatus || property.status || "active",
    isPublished: String(property.isPublished === true),
    featured: String(property.featured === true),
    verified: String(property.verified === true),
    sourceName: property.sourceName || "InvestAir",
    sourceUrl: property.sourceUrl || "",
    sourceListingId: property.sourceListingId || "",
    coverImage: property.coverImage || property.image || "",
    images: serializeImageList(property.images),
  };
}

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toPayload(formState) {
  return {
    name: formState.name.trim(),
    location: formState.location.trim(),
    addressLine1: formState.addressLine1.trim(),
    city: formState.city.trim(),
    state: formState.state.trim(),
    postalCode: formState.postalCode.trim(),
    country: formState.country.trim(),
    market: formState.market.trim(),
    propertyType: formState.propertyType.trim(),
    listingType: formState.listingType.trim(),
    investorHeadline: formState.investorHeadline.trim(),
    investorSummary: formState.investorSummary.trim(),
    description: formState.description.trim(),
    highlights: parseList(formState.highlights),
    trustBadges: parseList(formState.trustBadges),
    tags: parseList(formState.tags),
    beds: parseNumber(formState.beds),
    baths: parseNumber(formState.baths),
    sqft: parseNumber(formState.sqft),
    yearBuilt: parseNumber(formState.yearBuilt),
    totalValue: parseNumber(formState.totalValue),
    targetRaiseAmount: parseNumber(formState.targetRaiseAmount),
    expectedAnnualYield: parseNumber(formState.expectedAnnualYield),
    totalSlots: parseNumber(formState.totalSlots),
    fundedSlots: parseNumber(formState.fundedSlots),
    slotBasePriceMonthly: parseNumber(formState.slotBasePriceMonthly),
    currentDailyPayoutAmount: parseNumber(formState.currentDailyPayoutAmount),
    projectedMonthlyPayoutAmount: parseNumber(formState.projectedMonthlyPayoutAmount),
    projectedAnnualPayoutAmount: parseNumber(formState.projectedAnnualPayoutAmount),
    minimumInvestmentMonths: parseNumber(formState.minimumInvestmentMonths),
    maximumInvestmentMonths: parseNumber(formState.maximumInvestmentMonths),
    allowedDurations: formState.allowedDurations
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0),
    fundedPercentage: parseNumber(formState.fundedPercentage),
    totalInvestors: parseNumber(formState.totalInvestors),
    occupancyScore: parseNumber(formState.occupancyScore),
    demandScore: parseNumber(formState.demandScore),
    availabilityWindowLabel: formState.availabilityWindowLabel.trim(),
    riskLevel: formState.riskLevel,
    payoutCurrency: formState.payoutCurrency,
    status: formState.status,
    investmentStatus: formState.investmentStatus,
    isPublished: formState.isPublished === "true",
    featured: formState.featured === "true",
    verified: formState.verified === "true",
    sourceName: formState.sourceName.trim(),
    sourceUrl: formState.sourceUrl.trim(),
    sourceListingId: formState.sourceListingId.trim(),
    coverImage: formState.coverImage.trim(),
    images: parseImageList(formState.images),
  };
}

export default function PropertyEditor({ property, mode = "edit", busy = false, onCancel, onSubmit }) {
  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    setFormState(toFormState(property));
  }, [property]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  const previewImages = [formState.coverImage.trim(), ...parseImageList(formState.images)].filter(
    (value, index, collection) => value && collection.indexOf(value) === index
  );

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(toPayload(formState));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            {mode === "create" ? "Create property" : `Edit ${property?.name || "property"}`}
          </h3>
          <p className="mt-1 text-sm text-slate-500">Update the property story, payout settings, and core listing details.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Property name</span>
          <input name="name" value={formState.name} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Location</span>
          <input name="location" value={formState.location} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Address</span>
          <input name="addressLine1" value={formState.addressLine1} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">City</span>
          <input name="city" value={formState.city} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">State</span>
          <input name="state" value={formState.state} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Postal code</span>
          <input name="postalCode" value={formState.postalCode} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Country</span>
          <input name="country" value={formState.country} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Market</span>
          <input name="market" value={formState.market} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Property type</span>
          <input name="propertyType" value={formState.propertyType} onChange={handleChange} placeholder="boat_slip" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Listing type</span>
          <input name="listingType" value={formState.listingType} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Source name</span>
          <input name="sourceName" value={formState.sourceName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Source URL</span>
          <input name="sourceUrl" value={formState.sourceUrl} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Source listing ID</span>
          <input name="sourceListingId" value={formState.sourceListingId} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Investor headline</span>
          <input name="investorHeadline" value={formState.investorHeadline} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Investor summary</span>
          <textarea name="investorSummary" value={formState.investorSummary} onChange={handleChange} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Description</span>
          <textarea name="description" value={formState.description} onChange={handleChange} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Highlights</span>
          <textarea name="highlights" value={formState.highlights} onChange={handleChange} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
          <p className="text-xs text-slate-500">Add one highlight per line.</p>
        </label>
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Trust badges</span>
          <textarea name="trustBadges" value={formState.trustBadges} onChange={handleChange} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
          <p className="text-xs text-slate-500">Add one trust badge per line.</p>
        </label>
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Tags</span>
          <textarea name="tags" value={formState.tags} onChange={handleChange} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
          <p className="text-xs text-slate-500">Add one tag per line.</p>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Beds</span>
          <input name="beds" type="number" min="0" value={formState.beds} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Baths</span>
          <input name="baths" type="number" min="0" step="0.5" value={formState.baths} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Sqft</span>
          <input name="sqft" type="number" min="0" value={formState.sqft} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Year built</span>
          <input name="yearBuilt" type="number" min="0" value={formState.yearBuilt} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Total value</span>
          <input name="totalValue" type="number" min="0" step="0.01" value={formState.totalValue} onChange={handleChange} required={mode === "create"} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Target raise</span>
          <input name="targetRaiseAmount" type="number" min="0" step="0.01" value={formState.targetRaiseAmount} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Expected annual yield</span>
          <input name="expectedAnnualYield" type="number" min="0" step="0.01" value={formState.expectedAnnualYield} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Cover image URL</span>
          <input name="coverImage" value={formState.coverImage} onChange={handleChange} placeholder="https://..." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Gallery image URLs</span>
          <textarea
            name="images"
            value={formState.images}
            onChange={handleChange}
            rows={4}
            placeholder={"https://...\nhttps://..."}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300"
          />
          <p className="text-xs text-slate-500">Add one image URL per line. Comma-separated URLs also work.</p>
        </label>

        <div className="space-y-3 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Image preview</span>
          {previewImages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {previewImages.slice(0, 6).map((imageUrl) => (
                <div key={imageUrl} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="relative aspect-video bg-slate-100">
                    <Image src={imageUrl} alt="Property preview" fill unoptimized className="object-cover" />
                  </div>
                  <div className="truncate border-t border-slate-100 px-3 py-2 text-xs text-slate-500">{imageUrl}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
              Add a cover image or gallery URLs to preview property media here.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Slot base price</span>
          <input name="slotBasePriceMonthly" type="number" min="0" step="0.01" value={formState.slotBasePriceMonthly} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Daily payout</span>
          <input name="currentDailyPayoutAmount" type="number" min="0" step="0.01" value={formState.currentDailyPayoutAmount} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Projected monthly payout</span>
          <input name="projectedMonthlyPayoutAmount" type="number" min="0" step="0.01" value={formState.projectedMonthlyPayoutAmount} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Projected annual payout</span>
          <input name="projectedAnnualPayoutAmount" type="number" min="0" step="0.01" value={formState.projectedAnnualPayoutAmount} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Min months</span>
          <input name="minimumInvestmentMonths" type="number" min="1" value={formState.minimumInvestmentMonths} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Max months</span>
          <input name="maximumInvestmentMonths" type="number" min="1" value={formState.maximumInvestmentMonths} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700 xl:col-span-2">
          <span className="font-medium">Allowed durations</span>
          <input name="allowedDurations" value={formState.allowedDurations} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Funded %</span>
          <input name="fundedPercentage" type="number" min="0" max="100" value={formState.fundedPercentage} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Investors</span>
          <input name="totalInvestors" type="number" min="0" value={formState.totalInvestors} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Total slots</span>
          <input name="totalSlots" type="number" min="0" value={formState.totalSlots} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Funded slots</span>
          <input name="fundedSlots" type="number" min="0" value={formState.fundedSlots} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Occupancy score</span>
          <input name="occupancyScore" type="number" min="0" max="100" value={formState.occupancyScore} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Demand score</span>
          <input name="demandScore" type="number" min="0" max="100" value={formState.demandScore} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Availability label</span>
          <input name="availabilityWindowLabel" value={formState.availabilityWindowLabel} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Risk level</span>
          <select name="riskLevel" value={formState.riskLevel} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300">
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="elevated">Elevated</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Payout currency</span>
          <select name="payoutCurrency" value={formState.payoutCurrency} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300">
            <option value="USDT">USDT</option>
            <option value="USD">USD</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Status</span>
          <select name="status" value={formState.status} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="sold_out">Sold out</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Investment status</span>
          <select name="investmentStatus" value={formState.investmentStatus} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="sold_out">Sold out</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Show on frontend</span>
          <select name="isPublished" value={formState.isPublished} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300">
            <option value="false">Hidden</option>
            <option value="true">Visible</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Featured</span>
          <select name="featured" value={formState.featured} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Verified</span>
          <select name="verified" value={formState.verified} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : mode === "create" ? "Create property" : "Save changes"}
        </button>
      </div>
    </form>
  );
}