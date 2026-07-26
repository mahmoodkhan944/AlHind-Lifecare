import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Star, UserRound, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react";
import { db } from "@/api/dataClient";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLeadModal } from "@/lib/LeadModalContext";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516841273335-e39b37888115?w=1600&q=80";

const PAGE_SIZE = 12;

const parseList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const p = JSON.parse(val);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [speciality, setSpeciality] = useState("all");
  const [country, setCountry] = useState("all");
  const [page, setPage] = useState(1);
  const { openLeadModal } = useLeadModal();

  useEffect(() => {
    // FIX: fetch limit was 50, which would silently cap the list and break pagination
    // once the roster grows past that. Raised so pagination reflects the full dataset.
    db.entities.Doctor.filter({ status: "active" }, "-created_date", 500)
      .then(setDoctors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 whenever a filter changes, so results never open on an empty page.
  useEffect(() => {
    setPage(1);
  }, [search, speciality, country]);

  const filtered = doctors.filter((d) => {
    const matchSearch =
      !search ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.speciality?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = speciality === "all" || d.speciality === speciality;
    const matchCountry = country === "all" || d.country === country;
    return matchSearch && matchSpec && matchCountry;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const specialities = [...new Set(doctors.map((d) => d.speciality).filter(Boolean))];

  const ratedDoctors = doctors.filter((d) => d.rating > 0);
  const avgRating = ratedDoctors.length
    ? (ratedDoctors.reduce((sum, d) => sum + Number(d.rating), 0) / ratedDoctors.length).toFixed(1)
    : "4.8";

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 md:pb-14 overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-[#0E8C7A]/85" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pr-16 sm:pr-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-semibold text-white"
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            World-Class Medical Experts
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-heading font-extrabold text-[clamp(2rem,6.5vw,3.75rem)] text-white leading-[1.05] mb-5 text-balance"
          >
            Find the Right Doctor
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/85 text-base sm:text-lg max-w-2xl mb-6 sm:mb-8 text-balance"
          >
            Browse our network of world-renowned specialists across leading hospitals in India and
            Turkey, and get matched with the right expert for your treatment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl"
          >
            <div>
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                {doctors.length > 0 ? `${doctors.length}+` : "500+"}
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-1">Expert Doctors</p>
            </div>
            <div>
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                {specialities.length > 0 ? `${specialities.length}+` : "50+"}
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-1">Specialities</p>
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
                placeholder="Search by name or speciality..."
                className="pl-10 h-11 border-0 bg-muted/50 rounded-xl"
              />
            </div>
            <Select value={speciality} onValueChange={setSpeciality}>
              <SelectTrigger className="w-full md:w-48 h-11 rounded-xl border-0 bg-muted/50">
                <SelectValue placeholder="Speciality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialities</SelectItem>
                {specialities.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <div key={i} className="rounded-2xl border border-border/50 p-5 sm:p-6 animate-pulse flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-muted mb-4" />
                  <div className="h-4 w-2/3 bg-muted rounded mb-2" />
                  <div className="h-3 w-1/2 bg-muted rounded mb-4" />
                  <div className="h-8 w-full bg-muted rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-muted-foreground">
              <UserRound className="w-10 h-10 mx-auto mb-3 text-primary/40" />
              <p className="font-medium">No doctors found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginated.map((doc, i) => {
                const specializations = parseList(doc.specializations);
                const visibleTags = specializations.slice(0, 3);
                const extraTagsCount = specializations.length - visibleTags.length;

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                    className="flex flex-col h-full bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 text-center"
                  >
                    {/* Avatar with floating rating badge */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 ring-4 ring-white shadow-md">
                        {doc.photo_url ? (
                          <img
                            src={doc.photo_url}
                            alt={doc.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary/25">{doc.name?.[0]}</span>
                          </div>
                        )}
                      </div>
                      {doc.rating > 0 && (
                        <span className="absolute -top-1 -left-1 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shadow-md">
                          <Star className="w-3 h-3 fill-current" />
                          {doc.rating}
                        </span>
                      )}
                    </div>

                    {/* Name & speciality */}
                    <Link to={`/doctors/${doc.id}`} className="group">
                      <h3 className="font-heading font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {doc.name}
                      </h3>
                    </Link>
                    <p className="text-primary text-sm font-semibold mb-1 line-clamp-1">{doc.speciality}</p>
                    {doc.hospital_name && (
                      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {doc.hospital_name}
                      </p>
                    )}

                    {/* Specialization tags */}
                    {visibleTags.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                        {visibleTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {extraTagsCount > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                            +{extraTagsCount} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-2">
                      <Link to={`/doctors/${doc.id}`} className="flex-1">
                        <Button variant="outline" className="w-full h-9 rounded-full text-xs sm:text-sm">
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        onClick={() =>
                          openLeadModal({
                            title: "Book Appointment",
                            description: `Book a consultation with ${doc.name}.`,
                            treatmentInterest: doc.name,
                          })
                        }
                        className="flex-1 h-9 rounded-full text-xs sm:text-sm bg-gradient-to-r from-primary to-secondary text-white"
                      >
                        Book Now
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination — 12 doctors per page */}
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