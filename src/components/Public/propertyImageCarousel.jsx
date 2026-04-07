"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolvePropertyImages } from "@/lib/investmentPropertyUtils";

const SWIPE_THRESHOLD = 45;

export default function PropertyImageCarousel({ images, propertyName }) {
  const resolvedImages = resolvePropertyImages(Array.isArray(images) ? images : []);
  const totalImages = resolvedImages.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  const goToIndex = (nextIndex) => {
    if (!totalImages) {
      return;
    }

    const normalizedIndex = (nextIndex + totalImages) % totalImages;
    setActiveIndex(normalizedIndex);
  };

  const goToPrevious = () => {
    goToIndex(activeIndex - 1);
  };

  const goToNext = () => {
    goToIndex(activeIndex + 1);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (event) => {
    if (touchStartX.current === null) {
      return;
    }

    touchDeltaX.current = (event.touches[0]?.clientX ?? 0) - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) {
      return;
    }

    if (touchDeltaX.current <= -SWIPE_THRESHOLD) {
      goToNext();
    } else if (touchDeltaX.current >= SWIPE_THRESHOLD) {
      goToPrevious();
    }

    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div className="space-y-4">
      <div
        className="relative bg-neutral-100"
        style={{ aspectRatio: "4 / 3" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={resolvedImages[activeIndex]}
          alt={`${propertyName} photo ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />

        {totalImages > 1 ? (
          <>
            <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              {activeIndex + 1} / {totalImages}
            </div>

            <div className="absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-4 md:flex">
              <button
                type="button"
                onClick={goToPrevious}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition hover:bg-white"
                aria-label="Previous property image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition hover:bg-white"
                aria-label="Next property image"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        ) : null}
      </div>

      {totalImages > 1 ? (
        <div className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex justify-center gap-2 md:hidden">
            {resolvedImages.map((_, index) => (
              <button
                key={`${propertyName}-dot-${index}`}
                type="button"
                onClick={() => goToIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-slate-900" : "w-2.5 bg-slate-300"
                }`}
                aria-label={`View property image ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {resolvedImages.map((imageUrl, index) => (
              <button
                key={`${propertyName}-thumb-${index}`}
                type="button"
                onClick={() => goToIndex(index)}
                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border transition ${
                  index === activeIndex
                    ? "border-slate-900 ring-2 ring-slate-200"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                aria-label={`Select property image ${index + 1}`}
              >
                <Image
                  src={imageUrl}
                  alt={`${propertyName} thumbnail ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}