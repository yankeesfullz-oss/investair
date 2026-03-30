import Link from "next/link";
import { ArrowRight, Building2, Landmark, MapPin, TrendingUp, ShieldCheck } from "lucide-react";
import InvestmentPropertyCard from "@/components/Public/investmentPropertyCard";
import {
  getInvestmentOverview,
  getInvestmentPropertiesSorted,
  getInvestmentPropertyById,
} from "@/lib/investmentProperties"; // Updated helper name to be generic

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export const metadata = {
  title: "Investment Inventory | Investair",
  description: "Secure high-yield short-term rental contracts across the United States.",
};

export default async function InvestPage({ searchParams }) {
  const params = await searchParams;
  const selectedPropertyId = params?.property;
  const months = params?.months;
  const selectedProperty = getInvestmentPropertyById(selectedPropertyId);
  const properties = getInvestmentPropertiesSorted(selectedPropertyId);
  const overview = getInvestmentOverview();

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-stone-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-10">
        
        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-100 bg-stone-50 p-6 shadow-sm sm:p-8 lg:p-12">
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-600">
                <TrendingUp size={14} />
                National Investment Inventory
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-stone-950 sm:text-6xl">
                High-yield property contracts, <span className="text-rose-500">optimized for Airbnb.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-stone-600">
                Secure exclusive rental arbitrage contracts on premium properties across the USA. 
                Capitalize on the short-term stay market and generate consistent profits from 
                daily rental premiums without the overhead of ownership.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white px-6 py-3.5 text-sm font-bold text-stone-950 transition hover:border-stone-400 hover:shadow-md"
            >
              Adjust search
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* STATS GRID */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Active Listings", val: overview.propertyCount, icon: <Building2 className="text-rose-500" size={20}/> },
              { label: "US Markets", val: overview.cities, icon: <MapPin className="text-rose-500" size={20}/> },
              { label: "Monthly Entry", val: formatUsd(overview.lowestMonthlyPrice), icon: <ShieldCheck className="text-rose-500" size={20}/> },
              { label: "Max Daily Potential", val: formatUsd(overview.highestMonthlyPrice / 30), icon: <TrendingUp className="text-rose-500" size={20}/> },
            ].map((stat, i) => (
              <div key={i} className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-100 transition-hover hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{stat.label}</p>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-stone-950">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SELECTED PROPERTY SPOTLIGHT */}
        {selectedProperty && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2.5rem] bg-rose-500 p-8 text-white shadow-xl shadow-rose-200">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Target Match Found</span>
                </div>
                <h2 className="text-3xl font-bold sm:text-4xl">{selectedProperty.name}</h2>
                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-rose-50">
                  <span className="flex items-center gap-2">
                    <MapPin size={18} className="text-rose-200" />
                    {selectedProperty.address}
                  </span>
                  <span className="flex items-center gap-2">
                    <Landmark size={18} className="text-rose-200" />
                    {selectedProperty.investmentPricePerMonth} contract
                  </span>
                  {months && (
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-rose-200" />
                      {months} Month Term
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={months ? `/invest/${selectedProperty.id}?months=${months}` : `/invest/${selectedProperty.id}`}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-rose-500 transition hover:bg-stone-50 active:scale-95 shadow-lg"
              >
                Secure This Contract
              </Link>
            </div>
          </section>
        )}

        {/* INVENTORY LIST */}
        <section className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-stone-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-stone-950 tracking-tight">Available US Opportunities</h2>
              <p className="mt-1 text-stone-500">Live contracts ready for immediate short-term rental operation.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-bold text-stone-600">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              {properties.length} Markets Live
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <InvestmentPropertyCard
                key={property.id}
                property={property}
                highlighted={property.id === selectedPropertyId}
                months={months}
                // Ensure your card component uses Rose 500 for its internal buttons!
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}