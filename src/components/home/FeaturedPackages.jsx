import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Package as PackageIcon } from "lucide-react";
import { db } from "@/api/dataClient";
import { useSectionContent } from "@/hooks/useSectionContent";
import { formatPrice, discountPercent, packagePath, pluralize, toNumber } from "@/lib/packageUtils";

const MAX_CARDS = 12;

const sortPackages = (a, b) =>
  Number(!!b.featured) - Number(!!a.featured) ||
  (toNumber(a.sort_order) || 0) - (toNumber(b.sort_order) || 0) ||
  String(b.created_date || "").localeCompare(String(a.created_date || ""));

// Homepage carousel of treatment packages (from Admin → Packages).
// Shows 4 cards per row on desktop, 2 on tablet, swipeable on mobile.
export default function FeaturedPackages() {
  const [packages, setPackages] = useState([]);
  const [hospitals, setHospitals] = useState(new Map());
  const [treatments, setTreatments] = useState(new Map());
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scrollerRef = useRef(null);
  const header = useSectionContent("home_packages_header", {
    badge: "Treatment Packages",
    heading: "Popular Treatment Packages",
    subtitle: "All-inclusive packages with hospital, surgeon, stay and aftercare.",
  });

  useEffect(() => {
    Promise.all([
      db.entities.Package.filter({ status: "active" }, "-created_date", 200),
      db.entities.Hospital.list("name", 2000).catch(() => []),
      db.entities.Treatment.list("name", 2000).catch(() => []),
    ])
      .then(([pkgs, hs, ts]) => {
        setPackages([...pkgs].sort(sortPackages).slice(0, MAX_CARDS));
        setHospitals(new Map(hs.map((h) => [h.id, h])));
        setTreatments(new Map(ts.map((t) => [t.id, t])));
      })
      .catch(() => {});
  }, []);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [packages, updateArrows]);

  const step = (dir) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  if (packages.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          {header.badge && (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-3">
              {header.badge}
            </span>
          )}
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-secondary mb-2 text-balance">
            {header.heading}
          </h2>
          {header.subtitle && <p className="text-muted-foreground text-base max-w-3xl mx-auto">{header.subtitle}</p>}
        </div>

        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={updateArrows}
            className="flex gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory scroll-pl-4 sm:scroll-pl-0 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {packages.map((pkg, i) => (
              <HomePackageCard
                key={pkg.id}
                pkg={pkg}
                hospital={hospitals.get(pkg.hospital_id)}
                treatment={treatments.get(pkg.treatment_id)}
                index={i}
              />
            ))}
          </div>

          {canPrev && <Arrow dir="prev" onClick={() => step(-1)} />}
          {canNext && <Arrow dir="next" onClick={() => step(1)} />}
        </div>

        <div className="flex justify-center mt-6">
          <Link
            to="/packages"
            className="inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full border border-border bg-white shadow-sm hover:shadow-md hover:border-secondary/30 transition-all text-sm font-semibold text-secondary group"
          >
            Browse All Packages
            <span className="w-8 h-8 rounded-full bg-accent-jade text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Arrow({ dir, onClick }) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous packages" : "Next packages"}
      className={`hidden sm:flex absolute top-[30%] -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-border shadow-md items-center justify-center hover:bg-muted z-10 ${
        dir === "prev" ? "-left-4 lg:-left-5" : "-right-4 lg:-right-5"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function HomePackageCard({ pkg, hospital, treatment, index }) {
  const discount = discountPercent(pkg);
  const label = pkg.category || treatment?.name || pkg.title;
  const city = pkg.city || hospital?.city;
  const country = pkg.country || hospital?.country;
  const location = [city, country].filter(Boolean).join(" - ");
  const image = pkg.image_url || hospital?.cover_image_url;
  const to = packagePath(pkg);

  const points = [
    label,
    hospital?.name,
    toNumber(pkg.days_in_hospital) > 0 && `${pluralize(pkg.days_in_hospital, "day")} in hospital`,
    toNumber(pkg.nights_stay) > 0 && `${pluralize(pkg.nights_stay, "night")} accommodation`,
  ].filter(Boolean);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.06, 0.24) }}
      className="snap-start shrink-0 w-[85%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3.75rem)/4)] bg-white rounded-2xl border border-border shadow-sm hover:shadow-lg hover:shadow-secondary/5 transition-shadow overflow-hidden flex flex-col"
    >
      <Link to={to} className="relative block aspect-[4/3] bg-muted overflow-hidden group">
        {image ? (
          <img src={image} alt={pkg.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PackageIcon className="w-10 h-10 text-secondary/20" />
          </div>
        )}
        {location && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
            <span className="absolute bottom-3 right-3 text-[10px] font-extrabold tracking-[0.12em] uppercase text-white">
              {location}
            </span>
          </>
        )}
      </Link>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <Link to={to} className="flex items-center gap-2.5 group" title={pkg.title}>
          <span className="w-8 h-8 rounded-lg bg-secondary/5 text-secondary font-heading font-bold text-sm flex items-center justify-center shrink-0">
            {String(label).trim().charAt(0).toUpperCase()}
          </span>
          <h3 className="font-heading font-bold text-[15px] leading-snug text-secondary group-hover:text-primary transition-colors line-clamp-1">
            {label}
          </h3>
        </Link>
        {hospital?.name && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{hospital.name}</p>}

        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-3">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-heading font-extrabold text-2xl lg:text-xl xl:text-2xl text-secondary">{formatPrice(pkg.price, pkg.currency)}</span>
            {discount > 0 && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(pkg.original_price, pkg.currency)}</span>
            )}
          </div>
          {discount > 0 && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-accent-jade/10 text-accent-jade text-[11px] font-bold">
              Save {discount}%
            </span>
          )}
        </div>

        {points.length > 0 && (
          <ul className="space-y-1.5 mt-3">
            {points.map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-4 h-4 rounded-full bg-secondary/5 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-secondary" strokeWidth={3} />
                </span>
                <span className="line-clamp-1">{p}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4">
          <Link
            to={to}
            className="flex items-center justify-between gap-2 w-full h-11 pl-4 pr-1.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-sm lg:text-[13px] xl:text-sm font-heading font-bold whitespace-nowrap transition-colors"
          >
            View Package
            <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}