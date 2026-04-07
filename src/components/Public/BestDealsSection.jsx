import Link from "next/link";
import { ArrowRight, BarChart3, Tag } from "lucide-react";
import BestDealsCarousel from "@/components/Public/BestDealsCarousel";
import { getInvestmentProperties } from "@/lib/investmentProperties";
import { parseInvestmentPrice } from "@/lib/investmentPropertyUtils";

export default async function BestDealsSection() {
    const properties = await getInvestmentProperties();
    const normalized = Array.isArray(properties) ? properties : [];
    
    if (normalized.length === 0) {
        return null;
    }

    // 1. Highest Occupancy First (Requested: First Slide Show)
    const highestOccupancy = [...normalized]
        .sort((a, b) => Number(b.occupancyScore || 0) - Number(a.occupancyScore || 0))
        .slice(0, 6);

    // 2. Cheapest Entry Second (Requested: Second Slide Show)
    const cheapest = [...normalized]
        .sort((a, b) => parseInvestmentPrice(a.investmentPricePerMonth) - parseInvestmentPrice(b.investmentPricePerMonth))
        .slice(0, 6);

    return (
        <section className="bg-white px-4 py-12 text-slate-900 sm:px-6 md:px-10 lg:py-20">
            <div className="mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col gap-6 border-b border-slate-100 pb-12 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
                            Market Highlights
                        </p>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            Top performing opportunities
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-slate-600">
                            Explore properties curated by performance. We&apos;ve highlighted high-demand markets and low-barrier entries to help you diversify your portfolio.
                        </p>
                    </div>

                    <Link href="/invest" className="group inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-600">
                        View all 100+ properties
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Carousels: Stacked one on top of the other */}
                <div className="mt-12 space-y-20">
                    
                    {/* First: Highest Occupancy */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-950">Highest Occupancy</h3>
                                <p className="text-sm text-slate-500">Strongest rental demand and consistent daily payouts</p>
                            </div>
                        </div>
                        <BestDealsCarousel properties={highestOccupancy} />
                    </div>

                    {/* Second: Cheapest Entry */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-950">Cheapest Entry</h3>
                                <p className="text-sm text-slate-500">Accessible monthly starter rates for new investors</p>
                            </div>
                        </div>
                        <BestDealsCarousel properties={cheapest} />
                    </div>

                </div>
            </div>
        </section>
    );
}