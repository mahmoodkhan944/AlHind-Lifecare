import React from "react";

/**
 * A loading placeholder shaped like the detail pages (Treatment, Doctor,
 * Hospital) — a hero block followed by a two-column content area — so the
 * page doesn't just show a spinner on a blank screen while data loads.
 */
export default function DetailPageSkeleton() {
  return (
    <div className="animate-pulse">
      <section className="pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-4 w-32 bg-muted rounded mb-4 sm:mb-5" />
          <div className="h-[26rem] sm:h-[28rem] bg-muted rounded-3xl" />
        </div>
      </section>

      <section className="pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted/60 rounded-xl p-5 sm:p-6 space-y-3">
                  <div className="h-5 w-1/3 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-5/6 bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              ))}
            </div>
            <div>
              <div className="bg-muted/60 rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="h-5 w-1/2 bg-muted rounded" />
                <div className="h-11 w-full bg-muted rounded-xl" />
                <div className="h-11 w-full bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}