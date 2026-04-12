import Image from "next/image";
import Link from "next/link";

export default function Footer() {
	return (
		<footer className="mt-16 border-t border-slate-200 bg-[linear-gradient(180deg,#fffafc_0%,#ffffff_45%,#f8fafc_100%)] text-slate-600">
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
				<div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-8">
					<div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1.1fr] lg:gap-10">
					<div className="space-y-4">
						<Link href="/" className="inline-flex items-center rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100">
							<Image
								src="https://res.cloudinary.com/daiii0a2n/image/upload/v1774427795/images__1_-removebg-preview_uhco7w.png"
								alt="Investair"
								width={150}
								height={44}
								style={{ width: "auto" }}
								className="h-10 w-auto"
							/>
						</Link>
						<div>
							<h2 className="text-lg font-semibold tracking-tight text-slate-950">InvestAir - Invest Smarter with Ai Assistant</h2>
							<p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
								Explore guest-ready investment opportunities, learn how the platform works, and access the core pages that explain InvestAir, your privacy, and the terms that govern platform use.
							</p>
							<div className="mt-5 flex flex-wrap gap-3">
								<Link href="/invest" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">Explore investments</Link>
								<Link href="/contact-us" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Contact us</Link>
							</div>
						</div>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Explore</p>
						<div className="mt-4 flex flex-col gap-3 text-sm">
							<Link href="/" className="transition hover:text-slate-950">Home</Link>
							<Link href="/invest" className="transition hover:text-slate-950">Invest</Link>
							<Link href="/about-us" className="transition hover:text-slate-950">About</Link>
							<Link href="/contact-us" className="transition hover:text-slate-950">Contact</Link>
						</div>
						</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Contact</p>
						<div className="mt-4 space-y-3 text-sm leading-7">
							<a href="mailto:support@investair.online" className="block break-words transition hover:text-slate-950">support@investair.online</a>
							<a href="tel:+18506696798" className="block transition hover:text-slate-950">+1 (850) 669-6798</a>
							<p>887 Brannan Street, San Francisco, CA 94109, USA</p>
						</div>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Legal</p>
						<div className="mt-4 space-y-3 text-sm leading-7">
							<p>Registered in Delaware, United States</p>
							<p>LEI: 549300GX5CPIZQ5PDX31</p>
							<p>C/O Corporation Service Company, 254 Little Falls Drive, Wilmington, DE 19808</p>
						</div>
					</div>
				</div>

				<div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
					<p>© 2026 InvestAir.online | All Rights Reserved</p>
					<div className="flex flex-wrap gap-4">
						<Link href="/privacy" className="transition hover:text-slate-950">Privacy Policy</Link>
						<Link href="/terms" className="transition hover:text-slate-950">Terms of Service</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

