"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquareQuote, Star } from "lucide-react";
import { demoTestimonials } from "@/lib/demoTestimonials";

const ROTATION_MS = 4200;
const FADE_MS = 320;

function getCardsPerPage(width) {
  if (width < 768) {
    return 1;
  }

  if (width < 1280) {
    return 2;
  }

  return 3;
}

export default function TestimonialsSection() {
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [startIndex, setStartIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    function handleResize() {
      setCardsPerPage(getCardsPerPage(window.innerWidth));
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsFading(true);

      window.setTimeout(() => {
        setStartIndex((current) => (current + cardsPerPage) % demoTestimonials.length);
        setIsFading(false);
      }, FADE_MS);
    }, ROTATION_MS);

    return () => window.clearInterval(interval);
  }, [cardsPerPage]);

  const visibleTestimonials = useMemo(() => {
    return Array.from({ length: cardsPerPage }, (_, offset) => {
      const index = (startIndex + offset) % demoTestimonials.length;
      return demoTestimonials[index];
    });
  }, [cardsPerPage, startIndex]);

  const totalPages = Math.ceil(demoTestimonials.length / cardsPerPage);
  const activePage = Math.floor(startIndex / cardsPerPage);

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_38%),linear-gradient(180deg,#fdf2f8_0%,#fff8fb_38%,#fff1f2_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle,_rgba(251,113,133,0.15),_transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="rounded-[2.5rem] border border-white/70 bg-white/25 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700 backdrop-blur">
                <MessageSquareQuote className="h-3.5 w-3.5" />
                Open Comments / Testimonials
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                What other investors are saying  
              </h2>
             
            </div>

            <Link
              href="/investor/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Leave a Comment
            </Link>
          </div>

          <div
            className={`mt-8 grid gap-5 transition-opacity duration-300 ${
              cardsPerPage === 1 ? "grid-cols-1" : cardsPerPage === 2 ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"
            } ${isFading ? "opacity-0" : "opacity-100"}`}
          >
            {visibleTestimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="rounded-[2rem] border border-white/70 bg-white/35 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{testimonial.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{testimonial.location}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: testimonial.rating }, (_, index) => (
                      <Star key={`${testimonial.id}-star-${index}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="mt-5 text-sm leading-8 text-slate-700">“{testimonial.message}”</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
           
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(totalPages, 8) }, (_, index) => {
                const isActive = index === activePage % Math.min(totalPages, 8);
                return (
                  <button
                    key={`testimonial-page-${index}`}
                    type="button"
                    onClick={() => setStartIndex(index * cardsPerPage)}
                    className={`h-2.5 rounded-full transition-all ${isActive ? "w-8 bg-rose-600" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
                    aria-label={`Show testimonial group ${index + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}