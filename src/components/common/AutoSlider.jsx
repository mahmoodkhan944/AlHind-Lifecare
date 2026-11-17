import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * A row of cards for "Related …" sections: 4 per row on desktop, 2 on tablet,
 * ~1 on mobile (swipeable). When there are more cards than fit, it slides on
 * its own every few seconds (pausing while hovered or touched), loops back to
 * the start at the end, and shows prev/next arrows on tablet and desktop.
 */
export default function AutoSlider({ children, interval = 3500, label = "items" }) {
  const scrollerRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const pausedRef = useRef(false);
  const slides = React.Children.toArray(children).filter(Boolean);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setOverflowing(el.scrollWidth > el.clientWidth + 4);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, slides.length]);

  // Width of one card plus the gap — one "step".
  const stepSize = () => {
    const el = scrollerRef.current;
    const first = el?.firstElementChild;
    if (!el || !first) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const step = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir < 0 && atStart) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * stepSize(), behavior: "smooth" });
  }, []);

  // Auto-advance only when the cards don't all fit.
  useEffect(() => {
    if (!overflowing) return undefined;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = setInterval(() => {
      if (!pausedRef.current && document.visibilityState === "visible") step(1);
    }, interval);
    return () => clearInterval(id);
  }, [overflowing, interval, step]);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <div
      className="relative"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={() => setTimeout(resume, 4000)}
      onFocusCapture={pause}
      onBlurCapture={resume}
    >
      <div
        ref={scrollerRef}
        onScroll={update}
        className="flex gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory py-2 -my-2 -mx-4 px-4 scroll-pl-4 sm:mx-0 sm:px-0 sm:scroll-pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((child, i) => (
          <div
            key={child.key ?? i}
            className="snap-start shrink-0 flex w-[82%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-4.5rem)/4)] [&>*]:w-full"
          >
            {child}
          </div>
        ))}
      </div>

      {overflowing && (
        <>
          <SliderArrow dir="prev" label={label} onClick={() => step(-1)} dim={!canPrev} />
          <SliderArrow dir="next" label={label} onClick={() => step(1)} dim={!canNext} />
        </>
      )}
    </div>
  );
}

function SliderArrow({ dir, onClick, label, dim }) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? `Previous ${label}` : `Next ${label}`}
      className={`hidden sm:flex absolute top-[38%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-border shadow-md items-center justify-center hover:bg-muted transition-opacity ${
        dir === "prev" ? "-left-4 lg:-left-5" : "-right-4 lg:-right-5"
      } ${dim ? "opacity-60" : "opacity-100"}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}