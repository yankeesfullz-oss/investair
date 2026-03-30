"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/countryConfig";
import LanguageCurrencyCard from "./languageCurrencyCard";
import { useSearchExperience } from "./searchExperienceProvider";

function readStoredPreferences() {
	if (typeof window === "undefined") {
		return {
			country: null,
			language: null,
			currency: null,
		};
	}

	return {
		country: localStorage.getItem(STORAGE_KEYS.country),
		language: localStorage.getItem(STORAGE_KEYS.language),
		currency: localStorage.getItem(STORAGE_KEYS.currency),
	};
}

export default function Navbar() {
	const [open, setOpen] = useState(false);
	const [, setPreferences] = useState(readStoredPreferences);
	const pathname = usePathname();
	const { mode, setMode } = useSearchExperience();

	const activeMode = pathname?.startsWith("/invest") || pathname?.startsWith("/investor")
		? "invest"
		: pathname?.startsWith("/properties")
			? "buy"
			: mode;
	const isBuyActive = activeMode === "buy";
	const isInvestActive = activeMode === "invest";

	useEffect(() => {
		function onStorage() {
			setPreferences(readStoredPreferences());
		}
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	return (
		<>
			<header className="border-b border-neutral-200">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center justify-between gap-4 md:justify-start">
						<Link href="/" className="no-underline">
							<Image
								src="https://res.cloudinary.com/daiii0a2n/image/upload/v1774427795/images__1_-removebg-preview_uhco7w.png"
								alt="Investair"
								width={160}
								height={48}
								priority
								className="h-9 w-auto md:h-15"
							/>
						</Link>

						<div className="flex items-center gap-3 md:hidden">
							<button
								aria-label="Change language and currency"
								onClick={() => setOpen(true)}
								className="rounded-full border border-neutral-300 bg-white p-2 text-neutral-800 transition hover:bg-neutral-50"
							>
								<Globe size={18} />
							</button>
						</div>
					</div>

					<nav className="relative grid w-full grid-cols-2 overflow-hidden rounded-full bg-neutral-100 p-1 shadow-inner md:mx-auto md:max-w-md md:flex-1 md:w-auto">
						<div
							aria-hidden="true"
							className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
								isInvestActive ? "translate-x-full" : "translate-x-0"
							}`}
						/>
						<button
							type="button"
							onClick={() => setMode("buy")}
							className={`relative z-10 min-w-0 rounded-full px-4 py-2 text-center text-sm font-medium transition-colors duration-300 sm:px-5 ${isBuyActive ? "text-neutral-950" : "text-neutral-600 hover:text-neutral-950"}`}
							aria-pressed={isBuyActive}
						>
							Buy Property
						</button>
						<button
							type="button"
							onClick={() => setMode("invest")}
							className={`relative z-10 min-w-0 rounded-full px-4 py-2 text-center text-sm font-medium transition-colors duration-300 sm:px-5 ${isInvestActive ? "text-neutral-950" : "text-neutral-600 hover:text-neutral-950"}`}
							aria-pressed={isInvestActive}
						>
							Invest
						</button>
					</nav>

					<div className="hidden items-center gap-3 md:flex">
						<button
							aria-label="Change language and currency"
							onClick={() => setOpen(true)}
							className="rounded-full border border-neutral-300 p-2 text-neutral-800 bg-white hover:bg-neutral-50 transition"
						>
							<Globe size={18} />
						</button>
					</div>
				</div>
			</header>

			{open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4" onClick={() => setOpen(false)}>
					<div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
						<LanguageCurrencyCard onClose={() => setOpen(false)} />
					</div>
				</div>
			)}
		</>
	);
}

