import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Clock, DollarSign, TrendingUp, Stethoscope, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/api/dataClient";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLeadModal } from "@/lib/LeadModalContext";

const categories = [
  "Cardiology",
  "Oncology",
  "Neurology",
  "Neurosurgery",
  "Orthopedics",
  "Spine Surgery",
  "IVF",
  "Fertility Treatment",
  "Cosmetic Surgery",
  "Plastic Surgery",
  "Bariatric Surgery",
  "Dental Treatment",
  "Organ Transplant",
  "Kidney Treatment",
  "Liver Treatment",
  "Urology",
  "Ophthalmology",
  "ENT",
  "Gastroenterology",
  "Pulmonology",
  "Rheumatology",
  "Pediatrics",
  "Gynecology",
];

const PAGE_SIZE = 12;

export default function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const { openLeadModal } = useLeadModal();

  useEffect(() => {
    // FIX: fetch limit was 100, which would silently cap the list and break
    // pagination once the catalogue grows past that. Raised to cover the full set.
    db.entities.Treatment.filter({ status: "active" }, "-created_date", 1000)
      .then(setTreatments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 whenever a filter changes, so results never open on an empty page.
  useEffect(() => {
    setPage(1);
  }, [search, category]);

  const filtered = treatments.filter((t) => {
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || t.category === category;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 md:pb-14 overflow-hidden bg-gradient-to-br from-secondary via-secondary to-accent-jade">
        {/* Soft decorative glows, echoing the dot-grid/blob language used elsewhere on the site */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent-warm/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5 text-xs sm:text-sm font-semibold text-white tracking-wide"
          >
            <Stethoscope className="w-4 h-4 text-accent-warm" />
            Comprehensive Healthcare Services
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-extrabold text-[clamp(1.75rem,6vw,3.25rem)] text-white mb-3 text-balance"
          >
            Advanced Medical Treatments
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-9 text-balance"
          >
            Discover our range of specialized treatments delivered by expert doctors using cutting-edge technology and compassionate care.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-6 sm:gap-12"
          >
            {[
              { value: `${categories.length}+`, label: "Treatment Categories" },
              { value: "1,00,000+", label: "Patients Assisted" },
              { value: "98%", label: "Success Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-heading font-extrabold text-2xl sm:text-4xl text-white">{stat.value}</p>
                <p className="text-white/70 text-[11px] sm:text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
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
                placeholder="Search treatments..."
                className="pl-10 h-11 border-0 bg-muted/50 rounded-xl"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-56 h-11 rounded-xl border-0 bg-muted/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border/50 animate-pulse">
                  <div className="h-40 sm:h-44 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-muted-foreground">
              <Stethoscope className="w-10 h-10 mx-auto mb-3 text-primary/40" />
              <p className="font-medium">No treatments found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginated.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <Link to={`/treatments/${t.id}`} className="relative h-40 sm:h-44 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden shrink-0 block">
                    {t.image_url ? (
                      <img
                        src={t.image_url}
                        alt={t.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl font-bold text-primary/15">{t.name?.[0]}</span>
                      </div>
                    )}
                    {t.category && (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 sm:px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-primary">
                        {t.category}
                      </div>
                    )}
                  </Link>
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <Link to={`/treatments/${t.id}`}>
                      <h3 className="font-heading font-bold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {t.name}
                      </h3>
                    </Link>
                    {t.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{t.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground pt-3 border-t border-border/50 mb-4">
                      {t.cost_range_usd && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          {t.cost_range_usd}
                        </span>
                      )}
                      {t.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {t.duration}
                        </span>
                      )}
                      {t.success_rate && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                          {t.success_rate}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Link to={`/treatments/${t.id}`} className="flex-1">
                        <Button variant="outline" className="w-full h-9 rounded-full text-xs sm:text-sm">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        onClick={() =>
                          openLeadModal({
                            title: "Get a Free Quote",
                            description: `Get a free, no-obligation quote for ${t.name}.`,
                            treatmentInterest: t.name,
                          })
                        }
                        className="flex-1 h-9 rounded-full text-xs sm:text-sm bg-gradient-to-r from-primary to-secondary text-white"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination — 12 treatments per page */}
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