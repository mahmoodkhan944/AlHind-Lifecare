import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Building2,
  BedDouble,
  Hotel,
  ArrowRight,
  Package as PackageIcon,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { db } from "@/api/dataClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FlagIcon from "@/components/common/FlagIcon";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import {
  PACKAGE_COUNTRIES,
  COUNTRY_CODES,
  formatPrice,
  discountPercent,
  packagePath,
  pluralize,
  toNumber,
} from "@/lib/packageUtils";

const PAGE_SIZE = 10;
const PRICE_CAP = 20000; // slider's top end = "any price"
const PRICE_STEP = 500;

const HERO_IMAGE = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80";

const sortPackages = (a, b) =>
  Number(!!b.featured) - Number(!!a.featured) ||
  (toNumber(a.sort_order) || 0) - (toNumber(b.sort_order) || 0) ||
  String(b.created_date || "").localeCompare(String(a.created_date || ""));

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [hospitals, setHospitals] = useState(new Map());
  const [treatments, setTreatments] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Filters live in the URL so a filtered list can be shared/bookmarked,
  // e.g. /packages?country=Turkey&treatment=<id>
  const search = searchParams.get("q") || "";
  const treatmentId = searchParams.get("treatment") || "all";
  const country = searchParams.get("country") || "all";
  const maxPrice = Math.min(PRICE_CAP, toNumber(searchParams.get("max")) || PRICE_CAP);
  const page = Math.max(1, toNumber(searchParams.get("page")) || 1);

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "" || v === "all") next.delete(k);
      else next.set(k, String(v));
    });
    if (!("page" in changes)) next.delete("page");
    setSearchParams(next, { replace: true });
  };

  useDocumentMeta({
    title: "All-Inclusive Treatment Packages | AlHind Lifecare",
    description:
      "All-inclusive medical treatment packages in India, Turkey and UAE with transparent pricing — hospital, surgeon, hotel stay and aftercare included.",
  });

  useEffect(() => {
    Promise.all([
      db.entities.Package.filter({ status: "active" }, "-created_date", 2000),
      db.entities.Hospital.list("name", 2000).catch(() => []),
      db.entities.Treatment.list("name", 2000).catch(() => []),
    ])
      .then(([pkgs, hs, ts]) => {
        setPackages([...pkgs].sort(sortPackages));
        setHospitals(new Map(hs.map((h) => [h.id, h])));
        setTreatments(new Map(ts.map((t) => [t.id, t])));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Only offer treatments/countries that actually have packages.
  const treatmentOptions = useMemo(() => {
    const ids = new Set(packages.map((p) => p.treatment_id).filter(Boolean));
    return [...ids]
      .map((id) => treatments.get(id))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [packages, treatments]);

  const countryOptions = useMemo(() => {
    const used = new Set(packages.map((p) => p.country).filter(Boolean));
    const known = PACKAGE_COUNTRIES.filter((c) => used.has(c));
    const extra = [...used].filter((c) => !PACKAGE_COUNTRIES.includes(c)).sort();
    return [...known, ...extra];
  }, [packages]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return packages.filter((p) => {
      const hospital = hospitals.get(p.hospital_id);
      const treatment = treatments.get(p.treatment_id);
      if (q) {
        const haystack = [p.title, p.category, p.city, p.country, hospital?.name, treatment?.name, treatment?.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (treatmentId !== "all" && p.treatment_id !== treatmentId) return false;
      if (country !== "all" && p.country !== country) return false;
      if (maxPrice < PRICE_CAP && (toNumber(p.price) || 0) > maxPrice) return false;
      return true;
    });
  }, [packages, hospitals, treatments, search, treatmentId, country, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (p) => {
    updateParams({ page: p === 1 ? null : p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount =
    (search ? 1 : 0) + (treatmentId !== "all" ? 1 : 0) + (country !== "all" ? 1 : 0) + (maxPrice < PRICE_CAP ? 1 : 0);

  const clearFilters = () => setSearchParams(new URLSearchParams(), { replace: true });

  const filterPanel = (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-bold text-base">Find a Package</h2>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs font-semibold text-primary hover:underline">
            Clear all
          </button>
        )}
      </div>

      <FilterLabel>Treatment</FilterLabel>
      <div className="relative mb-2.5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => updateParams({ q: e.target.value })}
          placeholder="Search treatment, hospital, city..."
          className="pl-9 h-10 rounded-xl"
        />
      </div>
      <Select value={treatmentId} onValueChange={(v) => updateParams({ treatment: v })}>
        <SelectTrigger className="h-10 rounded-xl">
          <SelectValue placeholder="All Treatments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Treatments</SelectItem>
          {treatmentOptions.map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FilterLabel className="mt-6">Country</FilterLabel>
      <Select value={country} onValueChange={(v) => updateParams({ country: v })}>
        <SelectTrigger className="h-10 rounded-xl">
          <SelectValue placeholder="All Countries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {countryOptions.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {countryOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {countryOptions.map((c) => {
            const active = country === c;
            return (
              <button
                key={c}
                onClick={() => updateParams({ country: active ? null : c })}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                  active ? "bg-secondary text-white border-secondary" : "bg-white text-foreground border-border hover:border-secondary"
                }`}
              >
                {COUNTRY_CODES[c] && <FlagIcon code={COUNTRY_CODES[c]} className="!w-4 !h-3" />}
                {c}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-6 mb-3">
        <FilterLabel className="mb-0">Max Price</FilterLabel>
        <span className="text-xs font-bold text-secondary">
          {maxPrice >= PRICE_CAP ? "Any price" : `Up to ${formatPrice(maxPrice)}`}
        </span>
      </div>
      <Slider
        value={[maxPrice]}
        min={0}
        max={PRICE_CAP}
        step={PRICE_STEP}
        onValueChange={([v]) => updateParams({ max: v >= PRICE_CAP ? null : v })}
        aria-label="Maximum price"
      />
      <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
        <span>$0</span>
        <span>$20k+</span>
      </div>

      <div className="border-t border-border mt-5 pt-4 text-xs text-muted-foreground">
        {pluralize(filtered.length, "result")}
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 md:pb-14 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-secondary/85 to-accent-jade/80" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pr-16 sm:pr-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-semibold text-white"
          >
            <PackageIcon className="w-4 h-4 shrink-0" />
            Treatment Packages
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-heading font-extrabold text-[clamp(1.6rem,5.5vw,3.75rem)] text-white leading-[1.05] mb-5 text-balance"
          >
            All-inclusive <span className="text-accent-warm">treatment packages</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/85 text-base sm:text-lg max-w-2xl text-balance"
          >
            Transparent pricing with hospital, surgeon, hotel stay and aftercare included.
          </motion.p>
        </div>
      </section>

      <section className="py-8 sm:py-10 md:py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8 items-start">
            {/* Filters — sidebar on desktop, collapsible on mobile */}
            <aside>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="lg:hidden w-full flex items-center justify-between bg-white rounded-2xl border border-border px-4 py-3 text-sm font-semibold mb-3"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px]">{activeFilterCount}</span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">{showFilters ? "Hide" : "Show"}</span>
              </button>
              <div className={`${showFilters ? "block" : "hidden"} lg:block`}>{filterPanel}</div>
            </aside>

            {/* Results */}
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground mb-4">
                {loading ? "Loading packages…" : pluralize(filtered.length, "result")}
              </p>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border p-4 flex flex-col sm:flex-row gap-5 animate-pulse">
                      <div className="w-full sm:w-56 h-44 sm:h-40 rounded-xl bg-muted shrink-0" />
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-3 w-28 bg-muted rounded" />
                        <div className="h-5 w-3/4 bg-muted rounded" />
                        <div className="h-3 w-1/2 bg-muted rounded" />
                        <div className="h-6 w-40 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border p-10 text-center text-muted-foreground">
                  <PackageIcon className="w-10 h-10 mx-auto mb-3 text-primary/40" />
                  <p className="font-medium text-foreground">No packages found</p>
                  {activeFilterCount > 0 ? (
                    <Button variant="outline" onClick={clearFilters} className="mt-4 rounded-full gap-1.5">
                      <X className="w-4 h-4" /> Clear filters
                    </Button>
                  ) : (
                    <p className="text-sm mt-1">New packages are coming soon.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginated.map((pkg, i) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      hospital={hospitals.get(pkg.hospital_id)}
                      treatment={treatments.get(pkg.treatment_id)}
                      index={i}
                    />
                  ))}
                </div>
              )}

              {!loading && totalPages > 1 && (
                <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function PackageCard({ pkg, hospital, treatment, index = 0 }) {
  const discount = discountPercent(pkg);
  const label = pkg.category || treatment?.name;
  const location = [pkg.city || hospital?.city, pkg.country || hospital?.country].filter(Boolean).join(", ");
  const to = packagePath(pkg);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-lg hover:shadow-secondary/5 transition-shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-4 sm:gap-5"
    >
      <Link to={to} className="relative w-full sm:w-56 md:w-60 h-48 sm:h-auto sm:min-h-[150px] rounded-xl overflow-hidden bg-muted shrink-0">
        {pkg.image_url || hospital?.cover_image_url ? (
          <img
            src={pkg.image_url || hospital?.cover_image_url}
            alt={pkg.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PackageIcon className="w-10 h-10 text-secondary/20" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent-jade text-white text-[10px] font-extrabold tracking-wide shadow">
            SAVE {discount}%
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col px-1 sm:px-0 sm:py-1">
        {label && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent-jade mb-1 truncate">{label}</p>
        )}
        <Link to={to}>
          <h3 className="font-heading font-bold text-base sm:text-lg leading-snug text-secondary group-hover:text-primary transition-colors line-clamp-2">
            {pkg.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mt-2.5">
          {hospital?.name && (
            <span className="flex items-center gap-1 min-w-0">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[220px]">{hospital.name}</span>
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {location}
            </span>
          )}
          {toNumber(pkg.days_in_hospital) > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 shrink-0" /> {pluralize(pkg.days_in_hospital, "day")} in hospital
            </span>
          )}
          {toNumber(pkg.nights_stay) > 0 && (
            <span className="flex items-center gap-1">
              <Hotel className="w-3.5 h-3.5 shrink-0" /> {pluralize(pkg.nights_stay, "night")} stay
            </span>
          )}
        </div>


        <div className="flex items-end justify-between gap-3 mt-4 sm:mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            {discount > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(pkg.original_price, pkg.currency)}
              </span>
            )}
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-secondary">
              {formatPrice(pkg.price, pkg.currency)}
            </span>
          </div>
          <Link to={to}>
            <Button className="h-10 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold gap-1.5 px-4">
              View Package <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function FilterLabel({ children, className = "" }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 ${className}`}>{children}</p>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("gap-" + p);
      acc.push(p);
      return acc;
    }, []);

  const btn = "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-semibold transition-colors";
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 flex-wrap">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page" className={`${btn} border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40`}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p) =>
        typeof p === "string" ? (
          <span key={p} className="px-1 text-muted-foreground text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${p === page ? "bg-secondary text-white" : "border border-border bg-white text-foreground hover:bg-muted"}`}
          >
            {p}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Next page" className={`${btn} border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40`}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}