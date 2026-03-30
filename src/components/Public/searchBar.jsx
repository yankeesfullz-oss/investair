"use client";

import Image from "next/image";
import { Search, MapPin, CalendarRange, Navigation } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchExperience } from "./searchExperienceProvider";
import { investmentProperties, michiganInvestmentProperties } from "@/lib/investmentProperties";

const MONTH_OPTIONS = [3, 6, 9, 12, 18, 24];

export default function SearchBar() {
  const { mode } = useSearchExperience();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(null); // null, 'where', 'months'
  const [query, setQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [months, setMonths] = useState(6);
  const containerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return investmentProperties.filter((property) => {
      const haystack = [
        property.name,
        property.city,
        property.state,
        property.address,
        property.investmentPricePerMonth,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [query]);

  const resolvedActiveTab = mode === "buy" && activeTab === "months" ? null : activeTab;
  const showDuration = mode === "invest";

  const handleLocationSelect = (property) => {
    setSelectedProperty(property);
    setQuery("");
    setActiveTab(mode === "invest" ? "months" : null);
  };

  const handleSearch = (e) => {
    e.stopPropagation();
    if (!selectedProperty) {
        setActiveTab("where");
        return;
    };
    const params = new URLSearchParams({
      mode,
      property: selectedProperty.id,
      city: selectedProperty.city,
      state: selectedProperty.state,
    });

    if (mode === "invest") {
      params.set("months", String(months));
      params.set("investmentPricePerMonth", selectedProperty.investmentPricePerMonth);
    }

    router.push(`/invest?${params.toString()}`);
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl px-2 sm:px-4" ref={containerRef}>
      {/* MAIN PILL SEARCH BAR */}
      <div 
        className={`group flex flex-col gap-2 rounded-[2rem] border border-neutral-200 bg-white p-2 shadow-lg transition-all duration-300 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:rounded-full sm:p-1.5 ${
          activeTab ? "ring-4 ring-neutral-100/50" : ""
        }`}
      >
        {/* WHERE SECTION */}
        <button
          onClick={() => setActiveTab("where")}
          className={`flex w-full flex-1 items-center gap-3 rounded-[1.5rem] px-4 py-3 text-left transition-colors sm:rounded-full sm:px-6 sm:py-2.5 ${
            activeTab === "where" ? "bg-neutral-100" : "hover:bg-neutral-50"
          }`}
        >
          <MapPin size={18} className={selectedProperty ? "text-rose-500" : "text-neutral-400"} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 leading-none">Where</span>
            <span className="text-sm font-medium text-neutral-900 truncate">
              {selectedProperty ? `${selectedProperty.city}, ${selectedProperty.state}` : "Search U.S. opportunities"}
            </span>
          </div>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            showDuration ? "mx-1 hidden w-px opacity-100 sm:block" : "w-0 opacity-0"
          }`}
          aria-hidden={!showDuration}
        >
          <div className="h-8 w-px bg-neutral-200" />
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            showDuration ? "w-full max-w-full flex-1 opacity-100 translate-x-0 sm:max-w-xs" : "max-h-0 max-w-0 flex-[0_0_0%] opacity-0 translate-x-3 pointer-events-none sm:max-h-none"
          }`}
        >
          <button
            onClick={() => setActiveTab("months")}
            className={`flex w-full items-center gap-3 rounded-[1.5rem] px-4 py-3 text-left transition-all duration-300 sm:rounded-full sm:px-6 sm:py-2.5 ${
              resolvedActiveTab === "months" ? "bg-neutral-100" : "hover:bg-neutral-50"
            }`}
            tabIndex={showDuration ? 0 : -1}
            aria-hidden={!showDuration}
            type="button"
          >
            <CalendarRange size={18} className="text-neutral-400" />
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 leading-none">Duration</span>
              <span className="text-sm font-medium text-neutral-900">
                {months} Months
              </span>
            </div>
          </button>
        </div>

        {/* SEARCH BUTTON */}
        <button
          onClick={handleSearch}
          className="flex h-12 w-full items-center justify-center rounded-[1.5rem] bg-rose-500 text-white shadow-md shadow-rose-200 transition-transform hover:bg-rose-600 active:scale-95 sm:ml-2 sm:aspect-square sm:w-auto sm:rounded-full"
        >
          <Search size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* SUGGESTIONS DROPDOWN */}
      {resolvedActiveTab === "where" && (
        <div className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 sm:rounded-[2rem]">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-neutral-100 px-4 py-3">
            <Search size={18} className="text-neutral-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search U.S. property, city, state, or price"
              className="w-full bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </div>

          <div className="space-y-1">
            {/* NEARBY OPTION - Always first */}
            {!query && (
              <button
                onClick={() => handleLocationSelect(michiganInvestmentProperties[0])}
                className="group flex w-full items-start gap-4 rounded-xl p-3 text-left transition-colors hover:bg-rose-50 sm:items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <Navigation size={18} fill="currentColor" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-neutral-900">Featured Michigan opportunity</p>
                  <p className="text-xs text-neutral-500">Start with {michiganInvestmentProperties[0].name} in {michiganInvestmentProperties[0].city}</p>
                </div>
              </button>
            )}

              <p className="py-8 text-center text-sm text-neutral-400">No U.S. investment properties matched that search.</p>
            {query && filteredLocations.length > 0 ? (
              filteredLocations.slice(0, 8).map((property) => (
                <button
                  key={property.id}
                  onClick={() => handleLocationSelect(property)}
                  className="flex w-full items-start gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-50 sm:items-center sm:gap-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-500">
                    <Image src={property.image} alt={property.name} width={40} height={40} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-neutral-900">{property.name}</p>
                    <p className="truncate text-xs text-neutral-500">{property.city}, {property.state}</p>
                  </div>
                    <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-rose-600">{property.investmentPricePerMonth}</p>
                    <p className="text-xs text-neutral-400">per month</p>
                  </div>
                </button>
              ))
            ) : query && (
              <p className="py-8 text-center text-sm text-neutral-400">No U.S. investment properties matched that search.</p>
            )}
          </div>
        </div>
      )}

      {/* DURATION DROPDOWN */}
      <div
        className={`absolute left-0 right-0 top-full z-50 mt-3 transition-all duration-300 ease-out ${
          resolvedActiveTab === "months" && showDuration
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <div className="rounded-[1.75rem] border border-neutral-100 bg-white p-4 shadow-2xl sm:rounded-[2rem] sm:p-6">
          <p className="mb-4 text-sm font-bold text-neutral-900">Investment Duration</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MONTH_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setMonths(opt);
                  setActiveTab(null);
                }}
                className={`rounded-xl border py-3 text-sm font-semibold transition-all ${
                  months === opt
                    ? "border-rose-500 bg-rose-50 text-rose-600"
                    : "border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {opt} Months
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}