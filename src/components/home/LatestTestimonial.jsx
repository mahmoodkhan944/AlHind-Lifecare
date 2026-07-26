import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { db } from "@/api/dataClient";

const LIMIT = 10;
const AUTO_ADVANCE_MS = 5000;

export default function LatestTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);
  const autoplayRef = useRef(null);

  useEffect(() => {
    // "-created_date" = newest first, so the latest approved testimonials lead the slider.
    db.entities.Testimonial.filter({ status: "approved" }, "-created_date", LIMIT)
      .then(setTestimonials)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scrollByCard = useCallback((direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    const cardWidth = card ? card.offsetWidth + 16 : 320;
    track.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  }, []);

  // Autoplay — pauses on hover/touch and stops entirely once the user reaches the end.
  useEffect(() => {
    if (loading || testimonials.length < 2) return;
    const track = trackRef.current;
    if (!track) return;

    autoplayRef.current = setInterval(() => {
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard(1);
      }
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(autoplayRef.current);
  }, [loading, testimonials.length, scrollByCard]);

  const pause = () => clearInterval(autoplayRef.current);

  if (!loading && testimonials.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-secondary/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-3">
              Latest Testimonials
            </span>
            <h2 className="font-heading font-bold text-[clamp(1.4rem,3.6vw,2rem)] text-foreground text-balance">
              What Our Patients Are Saying
            </h2>
          </div>
          {/* Prev/Next controls — hidden on mobile where swipe is the natural gesture */}
          <div className="hidden sm:flex gap-2 shrink-0">
            <button
              onClick={() => {
                pause();
                scrollByCard(-1);
              }}
              aria-label="Previous testimonials"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                pause();
                scrollByCard(1);
              }}
              aria-label="Next testimonials"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[280px] sm:w-[340px] p-6 rounded-2xl bg-white border border-border/50 animate-pulse space-y-4"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 rounded-full bg-muted" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-5/6 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={trackRef}
            onMouseEnter={pause}
            onTouchStart={pause}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`section .flex.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                data-card
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="snap-start shrink-0 w-[280px] sm:w-[340px] flex flex-col p-6 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-lg transition-shadow relative"
              >
                <Quote className="absolute top-5 right-5 w-7 h-7 text-primary/10" />
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3.5 h-3.5 shrink-0 ${
                        j < (t.rating || 5) ? "text-amber-400 fill-amber-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-5 flex-1 line-clamp-4">
                  "{t.review_text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t mt-auto">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.patient_name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      t.patient_name?.[0]
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-sm truncate">{t.patient_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.country}
                      {t.treatment ? ` · ${t.treatment}` : ""}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:mt-10">
          <Link
            to="/testimonials"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/30 text-primary font-heading font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View All Testimonials <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}