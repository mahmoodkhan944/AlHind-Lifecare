import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Users, Bed, Star, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/api/dataClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeadModal } from "@/lib/LeadModalContext";

const PAGE_SIZE = 12;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=1600&q=80";

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [country, setCountry] = useState("all");
  const [page, setPage] = useState(1);
  const { openLeadModal } = useLeadModal();

  useEffect(() => {
    // FIX: fetch limit was 50, which would silently cap the list and break pagination
    // once the roster grows past that. Raised so pagination reflects the full dataset.
    db.entities.Hospital.filter({ status: "active" }, "-created_date", 500)
      .then(setHospitals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 whenever a filter changes, so results never open on an empty page.
  useEffect(() => {
    setPage(1);
  }, [search, country]);

  const filtered = hospitals.filter((h) => {
    const matchSearch =
      !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.city?.toLowerCase().includes(search.toLowerCase());
    const matchCountry = country === "all" || h.country === country;
    return matchSearch && matchCountry;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalBeds = hospitals.reduce((sum, h) => sum + (Number(h.beds_count) || 0), 0);
  const ratedHospitals = hospitals.filter((h) => h.rating > 0);
  const avgRating = ratedHospitals.length
    ? (ratedHospitals.reduce((sum, h) => sum + Number(h.rating), 0) / ratedHospitals.length).toFixed(1)
    : "4.8";

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 md:pb-14 overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/85 to-accent-jade/85" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pr-16 sm:pr-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-semibold text-white"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            Premier Healthcare Facilities
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-heading font-extrabold text-[clamp(1.1rem,6vw,3.75rem)] text-white leading-[1.05] mb-5 text-balance whitespace-nowrap"
          >
            Find the Right Hospital
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/85 text-base sm:text-lg max-w-2xl mb-6 sm:mb-8 text-balance"
          >
            Discover top-rated hospitals and medical centers equipped with advanced technology, expert
            staff, and comprehensive healthcare services.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl"
          >
            <div>
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                {hospitals.length > 0 ? `${hospitals.length}+` : "50+"}
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-1">Medical Facilities</p>
            </div>
            <div>
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                {totalBeds > 0 ? `${totalBeds}+` : "2500+"}
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-1">Total Beds</p>
            </div>
            <div>
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                {avgRating}
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-1">Average Rating</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 bg-white p-4 rounded-2xl shadow-lg shadow-black/5 border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hospitals..."
                className="pl-10 h-11 border-0 bg-muted/50 rounded-xl"
              />
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full md:w-40 h-11 rounded-xl border-0 bg-muted/50">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="Turkey">Turkey</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border/50 animate-pulse">
                  <div className="h-44 sm:h-48 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-muted-foreground">
              <Building2 className="w-10 h-10 mx-auto mb-3 text-primary/40" />
              <p className="font-medium">No hospitals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginated.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                >
                  <div className="card-premium group flex flex-col h-full overflow-hidden">
                  <Link
                    to={`/hospitals/${h.id}`}
                    className="flex flex-col flex-1"
                  >
                    <div className="relative h-44 sm:h-48 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden shrink-0">
                      {h.cover_image_url ? (
                        <img
                          src={h.cover_image_url}
                          alt={h.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl font-bold text-primary/15">{h.name?.[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="px-5 sm:px-6 pt-5 sm:pt-6 flex flex-col flex-1">
                      <h3 className="font-heading font-bold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {h.name}
                      </h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground mb-3 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {h.city}, {h.country}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                        {h.beds_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 shrink-0" />
                            {h.beds_count} Beds
                          </span>
                        )}
                        {h.doctors_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            {h.doctors_count} Doctors
                          </span>
                        )}
                        {h.rating && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current shrink-0" />
                            {h.rating}
                          </span>
                        )}
                        {h.established_year && <span>Est. {h.established_year}</span>}
                      </div>
                    </div>
                  </Link>
                  {/* Actions — outside the Link so "Get Quotation" can open the lead modal
                      without triggering navigation; "View Details" still links through. */}
                  <div className="flex gap-2 px-5 sm:px-6 pb-5 sm:pb-6 pt-3">
                    <Link to={`/hospitals/${h.id}`} className="flex-1">
                      <Button variant="outline" className="w-full h-9 rounded-full text-xs sm:text-sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      onClick={() =>
                        openLeadModal({
                          title: "Get a Free Quotation",
                          description: `Get a personalized quote for treatment at ${h.name}.`,
                          treatmentInterest: h.name,
                        })
                      }
                      className="flex-1 h-9 rounded-full text-xs sm:text-sm bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      Get Quotation
                    </Button>
                  </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination — 12 hospitals per page */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-10 flex-wrap">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p);
                  acc.push(p);
                  return acc;
                }, [])
                .map((p) =>
                  typeof p === "string" ? (
                    <span key={p} className="px-1 text-muted-foreground text-sm select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      aria-current={p === page ? "page" : undefined}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-semibold transition-colors ${
                        p === page
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "border border-border bg-white text-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}