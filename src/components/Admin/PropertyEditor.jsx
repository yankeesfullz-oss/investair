"use client";

import { useEffect, useState } from "react";

const initialState = {
  name: "",
  location: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  investorHeadline: "",
  investorSummary: "",
  description: "",
  totalValue: "",
  slotBasePriceMonthly: "",
  currentDailyPayoutAmount: "",
  minimumInvestmentMonths: "2",
  maximumInvestmentMonths: "",
  allowedDurations: "2,3,6,12",
  fundedPercentage: "",
  totalInvestors: "",
  occupancyScore: "",
  demandScore: "",
  status: "active",
  investmentStatus: "active",
  sourceUrl: "",
};

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
    investorHeadline: property.investorHeadline || "",
    investorSummary: property.investorSummary || "",
    description: property.description || "",
    totalValue: String(property.totalValue || ""),
    slotBasePriceMonthly: String(property.slotBasePriceMonthly || ""),
    currentDailyPayoutAmount: String(property.currentDailyPayoutAmount || ""),
    minimumInvestmentMonths: String(property.minimumInvestmentMonths || 2),
    maximumInvestmentMonths: String(property.maximumInvestmentMonths || ""),
    allowedDurations: Array.isArray(property.allowedDurations) ? property.allowedDurations.join(",") : "2,3,6,12",
    fundedPercentage: String(property.fundedPercentage || ""),
    totalInvestors: String(property.totalInvestors || ""),
    occupancyScore: String(property.occupancyScore || ""),
    demandScore: String(property.demandScore || ""),
    status: property.status || "active",
    investmentStatus: property.investmentStatus || property.status || "active",
    sourceUrl: property.sourceUrl || "",
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
    investorHeadline: formState.investorHeadline.trim(),
    investorSummary: formState.investorSummary.trim(),
    description: formState.description.trim(),
    totalValue: parseNumber(formState.totalValue),
    slotBasePriceMonthly: parseNumber(formState.slotBasePriceMonthly),
    currentDailyPayoutAmount: parseNumber(formState.currentDailyPayoutAmount),
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
    status: formState.status,
    investmentStatus: formState.investmentStatus,
    sourceUrl: formState.sourceUrl.trim(),
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
          <span className="font-medium">Source URL</span>
          <input name="sourceUrl" value={formState.sourceUrl} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
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
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Total value</span>
          <input name="totalValue" type="number" min="0" step="0.01" value={formState.totalValue} onChange={handleChange} required={mode === "create"} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
        </label>
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