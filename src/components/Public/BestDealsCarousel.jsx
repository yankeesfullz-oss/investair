"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import { getPropertyPath } from "@/lib/site";

const SWIPE_THRESHOLD = 45;
const AUTOPLAY_MS = 8000;

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

// Reusable Carousel Component
function PropertyCarousel({ properties, title, subtitle }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);
  const totalSlides = properties.length;

  function goToIndex(nextIndex) {
    if (!totalSlides) return;
    const normalizedIndex = (nextIndex + totalSlides) % totalSlides;
    setActiveIndex(normalizedIndex);
  }

  const goToPrevious = () => goToIndex(activeIndex - 1);
  const goToNext = () => goToIndex(activeIndex + 1);

  useEffect(() => {
    if (totalSlides <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalSlides);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, totalSlides]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    if (touchDeltaX.current <= -SWIPE_THRESHOLD) goToNext();
    else if (touchDeltaX.current >= SWIPE_THRESHOLD) goToPrevious();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (properties.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="px-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="text-slate-500 text-sm">{subtitle}</p>
      </div>

      <div
        className="relative overflow-hidden rounded-[2rem] border border-rose-100 bg-[linear-gradient(180deg,#fff7fb_0%,#ffffff_100%)] shadow-[0_20px_80px_rgba(15,23,42,0.08)]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {properties.map((property) => (
            <div key={property.id} className="w-full shrink-0 p-4 sm:p-5 lg:p-6">
              <Link href={getPropertyPath(property)} className="group block overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-sm transition hover:shadow-xl">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="relative min-h-64 bg-slate-100 sm:min-h-80 lg:min-h-full">
                    <Image
                      src={Array.isArray(property.images) ? property.images[0] : property.image}
                      alt={property.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute left-4 top-4 rounded-full border border-black bg-rose-500 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                      Featured
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-5 sm:p-6 lg:p-8">
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">Investment Opportunity</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{property.name}</h3>
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="h-4 w-4 text-rose-500" />
                          <span className="truncate">{property.address}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-3 sm:p-4 text-center sm:text-left">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Entry</p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">{formatUsd(property.monthlyInvestmentAmount)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 sm:p-4 text-center sm:text-left">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Occupancy</p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">{property.occupancyScore}%</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 sm:p-4 text-center sm:text-left">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Payout</p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">{formatUsd(property.currentDailyPayoutAmount)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {property.totalInvestors} active
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {property.allowedDurations[0]}+ mo
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-rose-600">
                      Details <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {totalSlides > 1 && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-4 md:flex">
              <button onClick={goToPrevious} className="pointer-events-auto h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-md hover:bg-rose-50 transition">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={goToNext} className="pointer-events-auto h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-md hover:bg-rose-50 transition">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between border-t border-rose-50 px-6 py-4 md:hidden">
              <button onClick={goToPrevious} className="text-sm font-bold flex items-center gap-1"><ChevronLeft className="h-4 w-4"/> Prev</button>
              <div className="flex gap-1.5">
                {properties.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-4 bg-rose-500" : "w-1.5 bg-rose-200"}`} />
                ))}
              </div>
              <button onClick={goToNext} className="text-sm font-bold flex items-center gap-1">Next <ChevronRight className="h-4 w-4"/></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Main Page Component
export default function BestDealsCarousel({ properties = [] }) {
  // 1. Highest Occupancy First
  const highestOccupancyDeals = useMemo(() => {
    return [...properties].sort((a, b) => (b.occupancyScore || 0) - (a.occupancyScore || 0));
  }, [properties]);

  // 2. Cheapest Entry First
  const cheapestEntryDeals = useMemo(() => {
    return [...properties].sort((a, b) => (a.monthlyInvestmentAmount || 0) - (b.monthlyInvestmentAmount || 0));
  }, [properties]);

  if (!properties.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
      <PropertyCarousel 
        properties={highestOccupancyDeals} 
        title="High Occupancy Picks" 
        subtitle="Properties with the highest consistent rental demand."
      />
      
      <PropertyCarousel 
        properties={cheapestEntryDeals} 
        title="Best Entry Prices" 
        subtitle="Low-cost entry points for diversified investing."
      />
    </div>
  );
}