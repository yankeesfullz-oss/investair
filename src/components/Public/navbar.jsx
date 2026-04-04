"use client";

import { useEffect, useState } from "react";
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
			<header className="border-b border-neutral-200 bg-white/95 backdrop-blur">
				<div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 px-4 py-3 sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8">
					<div className="flex items-center justify-between gap-4 md:justify-start">
						<Link href="/" className="no-underline">
							<Image
								src="https://res.cloudinary.com/daiii0a2n/image/upload/v1774427795/images__1_-removebg-preview_uhco7w.png"
								alt="Investair"
								width={160}
								height={48}
								priority
								className="h-9 w-auto md:h-12 md:w-auto"
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

					<nav className="flex justify-center md:justify-center">
						<Link
							href="/invest"
							onClick={() => setMode("invest")}
							className={`inline-flex min-w-44 items-center justify-center rounded-full border-2 border-black px-6 py-3 text-center text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(244,63,94,0.24)] transition hover:-translate-y-0.5 hover:bg-rose-600 ${
								isInvestActive ? "bg-rose-600" : "bg-rose-500"
							}`}
							aria-pressed={isInvestActive}
						>
							Invest Now
						</Link>
					</nav>

					<div className="hidden items-center justify-end gap-3 md:flex">
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

