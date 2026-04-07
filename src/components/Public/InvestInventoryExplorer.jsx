"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import InvestmentPropertyCard from "@/components/Public/investmentPropertyCard";
import { parseInvestmentPrice } from "@/lib/investmentPropertyUtils";

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function buildLocationLabel(property) {
  const city = String(property?.city || "").trim();
  const state = String(property?.state || "").trim();
  return [city, state].filter(Boolean).join(", ");
}

export default function InvestInventoryExplorer({
  properties = [],
  months,
  selectedPropertyId,
  initialLocationQuery = "",
}) {
  const containerRef = useRef(null);
  const priceValues = useMemo(() => {
    return properties
      .map((property) => parseInvestmentPrice(property.investmentPricePerMonth))
      .filter((value) => Number.isFinite(value) && value > 0);
  }, [properties]);

  const minBudget = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const maxBudgetBound = priceValues.length > 0 ? Math.max(...priceValues) : 0;

  const [locationQuery, setLocationQuery] = useState(initialLocationQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [maxBudget, setMaxBudget] = useState(maxBudgetBound);

  useEffect(() => {
    setLocationQuery(initialLocationQuery);
  }, [initialLocationQuery]);

  useEffect(() => {
    setMaxBudget(maxBudgetBound);
  }, [maxBudgetBound]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const locationOptions = useMemo(() => {
    return [...new Set(
      properties
        .map((property) => buildLocationLabel(property))
        .filter(Boolean)
    )].sort((left, right) => left.localeCompare(right));
  }, [properties]);

  const suggestions = useMemo(() => {
    const query = locationQuery.trim().toLowerCase();

    if (!query) {
      return locationOptions.slice(0, 6);
    }

    return locationOptions
      .filter((option) => option.toLowerCase().includes(query))
      .slice(0, 8);
  }, [locationOptions, locationQuery]);

  const filteredProperties = useMemo(() => {
    const query = locationQuery.trim().toLowerCase();

    return properties.filter((property) => {
      const monthlyPrice = parseInvestmentPrice(property.investmentPricePerMonth);
      if (Number.isFinite(maxBudget) && maxBudget > 0 && monthlyPrice > maxBudget) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        property.name,
        property.city,
        property.state,
        property.address,
        buildLocationLabel(property),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [locationQuery, maxBudget, properties]);

  const hasActiveFilters = locationQuery.trim() || (maxBudgetBound > 0 && maxBudget < maxBudgetBound);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-stone-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-950">Available US Opportunities</h2>
          <p className="mt-1 text-stone-500">Filter by location and monthly entry budget as you browse live inventory.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-bold text-stone-600">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          {filteredProperties.length} Matching Opportunities
        </div>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-stone-100 bg-stone-50 p-4 sm:p-5 lg:grid-cols-[1.3fr_0.9fr]">
        <div ref={containerRef} className="relative">
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            <MapPin size={14} />
            Search location
          </label>
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-stone-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-stone-400" />
            <input
              value={locationQuery}
              onChange={(event) => {
                setLocationQuery(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search city or state"
              className="w-full bg-transparent text-sm font-medium text-stone-900 outline-none placeholder:text-stone-400"
            />
            {locationQuery ? (
              <button
                type="button"
                onClick={() => {
                  setLocationQuery("");
                  setShowSuggestions(false);
                }}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 transition hover:text-stone-700"
              >
                Clear
              </button>
            ) : null}
          </div>

          {showSuggestions && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-full z-20 mt-3 overflow-hidden rounded-[1.5rem] border border-stone-100 bg-white p-2 shadow-xl">
              {suggestions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setLocationQuery(option);
                    setShowSuggestions(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-stone-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{option}</p>
                    <p className="text-xs text-stone-500">Filter opportunities in this market</p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            <SlidersHorizontal size={14} />
            Monthly budget
          </label>
          <div className="rounded-[1.5rem] border border-stone-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Max entry</p>
                <p className="mt-1 text-lg font-semibold text-stone-950">{formatUsd(maxBudget || maxBudgetBound)}</p>
              </div>
              <p className="text-xs text-stone-500">From {formatUsd(minBudget)}</p>
            </div>
            <input
              type="range"
              min={minBudget || 0}
              max={maxBudgetBound || 0}
              step={50}
              value={maxBudgetBound > 0 ? maxBudget : 0}
              onChange={(event) => setMaxBudget(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-rose-500"
              disabled={maxBudgetBound <= 0}
            />
          </div>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-3">
          {locationQuery.trim() ? (
            <span className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
              Market: {locationQuery}
            </span>
          ) : null}
          {maxBudgetBound > 0 && maxBudget < maxBudgetBound ? (
            <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
              Budget up to {formatUsd(maxBudget)}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setLocationQuery("");
              setMaxBudget(maxBudgetBound);
            }}
            className="text-sm font-semibold text-stone-500 transition hover:text-stone-900"
          >
            Reset filters
          </button>
        </div>
      ) : null}

      {filteredProperties.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <InvestmentPropertyCard
              key={property.id}
              property={property}
              highlighted={property.id === selectedPropertyId}
              months={months}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-stone-100 bg-stone-50 p-8 text-sm text-stone-600">
          No opportunities matched the current market and budget filters.
        </div>
      )}
    </section>
  );
}