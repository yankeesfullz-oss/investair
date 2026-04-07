"use client";

import Image from "next/image";
import { Search, MapPin, CalendarRange, Navigation, X, ArrowLeft } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchExperience } from "./searchExperienceProvider";
import { apiFetch } from "@/lib/apiClient";
import { filterPublicInvestmentProperties } from "@/lib/investmentPropertyUtils";
import { getCanonicalPropertySegment } from "@/lib/site";

const MONTH_OPTIONS = [3, 6, 9, 12, 18, 24];

export default function SearchBar() {
  const { mode } = useSearchExperience();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(null); // 'where', 'months', or null
  const [query, setQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [months, setMonths] = useState(6);
  const [properties, setProperties] = useState([]);
  const containerRef = useRef(null);

  // Sync mode changes
  const showDuration = mode === "invest";

  // Auto-close dropdowns on click outside (Desktop only)
  useEffect(() => {
    function handleClickOutside(event) {
      if (window.innerWidth >= 640 && containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile overlay is open
  useEffect(() => {
    if (activeTab && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [activeTab]);

  useEffect(() => {
    let ignore = false;
    async function loadProperties() {
      try {
        const response = await apiFetch("/api/properties");
        if (!ignore) setProperties(filterPublicInvestmentProperties(response));
      } catch (error) {
        if (!ignore) setProperties([]);
      }
    }
    void loadProperties();
    return () => { ignore = true; };
  }, []);

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return properties.filter((p) => 
      [p.name, p.city, p.state, p.address].join(" ").toLowerCase().includes(q)
    );
  }, [properties, query]);

  const featuredProperty = properties[0] || null;

  const handleLocationSelect = (property) => {
    setSelectedProperty(property);
    setQuery("");
    if (showDuration) {
      setActiveTab("months");
    } else {
      setActiveTab(null);
    }
  };

  const handleSearch = (e) => {
    e?.stopPropagation();
    if (!selectedProperty) {
      // If user typed a freeform query, try to interpret it as "City, State"
      const q = query.trim();

      if (!q) {
        setActiveTab("where");
        return;
      }

      let city = "";
      let stateVal = "";

      const parts = q.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        city = parts[0];
        stateVal = parts[1];
      } else if (filteredLocations.length > 0) {
        // Fallback: select first matching property
        const first = filteredLocations[0];
        city = first.city || '';
        stateVal = first.state || '';
      } else {
        // nothing to search for
        setActiveTab("where");
        return;
      }

      const params = new URLSearchParams({
        mode,
        city,
        state: stateVal,
      });

      if (mode === 'invest') {
        params.set('months', String(months));
      }

      router.push(`/invest?${params.toString()}`);
      setActiveTab(null);
      return;
    }
    const params = new URLSearchParams({
      mode,
      property: getCanonicalPropertySegment(selectedProperty),
      city: selectedProperty.city,
      state: selectedProperty.state,
    });

    if (showDuration) {
      params.set("months", String(months));
      params.set("investmentPricePerMonth", selectedProperty.investmentPricePerMonth);
    }

    router.push(`/invest?${params.toString()}`);
    setActiveTab(null);
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4" ref={containerRef}>
      {/* --- DESKTOP & MOBILE TRIGGER BAR --- */}
      <div 
        className={`group flex items-center rounded-full border border-neutral-200 bg-white p-1.5 shadow-lg transition-all duration-300 hover:shadow-xl ${
          activeTab ? "ring-4 ring-neutral-100/50" : ""
        }`}
      >
        {/* WHERE BUTTON */}
        <button
          onClick={() => setActiveTab("where")}
          className={`flex flex-1 items-center gap-3 rounded-full px-4 py-2 text-left transition-colors sm:px-6 ${
            activeTab === "where" ? "bg-neutral-100" : "hover:bg-neutral-50"
          }`}
        >
          <MapPin size={18} className={selectedProperty ? "text-rose-500" : "text-neutral-400"} />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 leading-none">Where</span>
            <span className="truncate text-sm font-medium text-neutral-900">
              {selectedProperty ? `${selectedProperty.city}, ${selectedProperty.state}` : "Anywhere"}
            </span>
          </div>
        </button>

        {/* DURATION BUTTON (Conditional) */}
        {showDuration && (
          <>
            <div className="h-8 w-px bg-neutral-200 mx-1 hidden sm:block" />
            <button
              onClick={() => setActiveTab("months")}
              className={`flex flex-1 items-center gap-3 rounded-full px-4 py-2 text-left transition-colors sm:px-6 ${
                activeTab === "months" ? "bg-neutral-100" : "hover:bg-neutral-50"
              }`}
            >
              <CalendarRange size={18} className="text-neutral-400" />
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 leading-none">Duration</span>
                <span className="text-sm font-medium text-neutral-900">{months} Months</span>
              </div>
            </button>
          </>
        )}

        {/* SEARCH ICON BUTTON */}
        <button
          onClick={handleSearch}
          className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-md shadow-rose-200 transition-transform hover:bg-rose-600 active:scale-95 sm:h-12 sm:w-12"
        >
          <Search size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* --- MOBILE OVERLAY (Visible only on mobile when a tab is active) --- */}
      {activeTab && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-50 sm:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between border-b bg-white p-4">
            <button onClick={() => setActiveTab(null)} className="p-2 -ml-2 text-neutral-600">
              <ArrowLeft size={20} />
            </button>
            <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              {activeTab === "where" ? "Location" : "Duration"}
            </span>
            <button onClick={() => setActiveTab(null)} className="p-2 -mr-2 text-neutral-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "where" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-white border border-neutral-200 px-4 py-3 shadow-sm">
                  <Search size={18} className="text-neutral-500" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="City, state, or price..."
                    className="w-full bg-transparent text-base outline-none"
                  />
                </div>
                <SuggestionList 
                  query={query} 
                  filteredLocations={filteredLocations} 
                  featuredProperty={featuredProperty} 
                  onSelect={handleLocationSelect} 
                />
              </div>
            ) : (
              <DurationPicker 
                months={months} 
                setMonths={setMonths} 
                onSelect={() => setActiveTab(null)} 
              />
            )}
          </div>
          
          <div className="border-t bg-white p-4">
             <button 
                onClick={handleSearch}
                className="w-full rounded-2xl bg-rose-500 py-4 text-center font-bold text-white shadow-lg"
             >
                Search Options
             </button>
          </div>
        </div>
      )}

      {/* --- DESKTOP DROPDOWNS --- */}
      <div className="hidden sm:block">
        {activeTab === "where" && (
          <div className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-[2rem] border border-neutral-100 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-neutral-100 px-4 py-3">
              <Search size={18} className="text-neutral-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search U.S. property, city, state, or price"
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
            </div>
            <SuggestionList 
                query={query} 
                filteredLocations={filteredLocations} 
                featuredProperty={featuredProperty} 
                onSelect={handleLocationSelect} 
            />
          </div>
        )}

        {activeTab === "months" && (
          <div className="absolute right-0 top-full z-50 mt-3 w-80 rounded-[2rem] border border-neutral-100 bg-white p-6 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <DurationPicker 
                months={months} 
                setMonths={setMonths} 
                onSelect={() => setActiveTab(null)} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS TO REDUCE REPETITION ---

function SuggestionList({ query, filteredLocations, featuredProperty, onSelect }) {
  return (
    <div className="space-y-1">
      {!query && (
        featuredProperty ? (
          <button
            onClick={() => onSelect(featuredProperty)}
            className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-rose-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white">
              <Navigation size={18} fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">Featured opportunity</p>
              <p className="text-xs text-neutral-500">{featuredProperty.name} in {featuredProperty.city}</p>
            </div>
          </button>
        ) : (
          <p className="py-8 text-center text-sm text-neutral-400">No live backend properties available.</p>
        )
      )}

      {query && filteredLocations.length > 0 ? (
        filteredLocations.map((property) => (
          <button
            key={property.id}
            onClick={() => onSelect(property)}
            className="flex w-full items-center gap-4 rounded-xl p-3 transition-colors hover:bg-neutral-50"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-100">
              <Image src={property.image} alt={property.name} width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-neutral-900">{property.name}</p>
              <p className="truncate text-xs text-neutral-500">{property.city}, {property.state}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-rose-600">{property.investmentPricePerMonth}</p>
            </div>
          </button>
        ))
      ) : query && (
        <p className="py-8 text-center text-sm text-neutral-400">No properties matched that search.</p>
      )}
    </div>
  );
}

function DurationPicker({ months, setMonths, onSelect }) {
  return (
    <div>
      <p className="mb-4 text-sm font-bold text-neutral-900">How many months?</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MONTH_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setMonths(opt);
              onSelect();
            }}
            className={`rounded-xl border py-4 text-sm font-semibold transition-all sm:py-3 ${
              months === opt
                ? "border-rose-500 bg-rose-50 text-rose-600 shadow-sm"
                : "border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {opt} Months
          </button>
        ))}
      </div>
    </div>
  );
}