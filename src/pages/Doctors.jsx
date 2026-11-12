import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, UserRound, ChevronLeft, ChevronRight, Stethoscope, GraduationCap, Hourglass, Building2 } from "lucide-react";
import { db } from "@/api/dataClient";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLeadModal } from "@/lib/LeadModalContext";
import { formatCountApprox } from "@/lib/utils";
import { doctorPath } from "@/lib/paths";
import { SHOW_TURKEY } from "@/lib/siteConfig";
import { visibleGroups } from "@/lib/sectionGroups";

const PAGE_SIZE = 12;

const HERO_IMAGE =
  "https://plus.unsplash.com/premium_photo-1681843126728-04eab730febe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D";

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
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/85 to-accent-jade/85" />
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
            className="font-heading font-extrabold text-[clamp(1.2rem,6vw,3.75rem)] text-white leading-[1.05] mb-5 text-balance whitespace-nowrap"
          >
            Find the Right Doctor
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/85 text-base sm:text-lg max-w-2xl mb-6 sm:mb-8 text-balance"
          >
            Browse our network of world-renowned specialists across leading hospitals in India{SHOW_TURKEY ? " and Turkey" : ""}, and get matched with the right expert for your treatment.
          </motion.p>
          
        </div>

      </section>

      <section className="py-6 sm:py-7 md:py-7">
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
                {SHOW_TURKEY && <SelectItem value="Turkey">Turkey</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-white p-4 sm:p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-xl bg-muted shrink-0" />
                    <div className="flex-1 space-y-2.5 pt-1">
                      <div className="h-4 w-2/3 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                      <div className="h-3 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-2/3 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-10 w-full bg-muted rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-muted-foreground">
              <UserRound className="w-10 h-10 mx-auto mb-3 text-primary/40" />
              <p className="font-medium">No doctors found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {paginated.map((doc, i) => (
                <DoctorCard
                  key={doc.id}
                  doc={doc}
                  index={i}
                  onBook={() =>
                    openLeadModal({
                      title: "Book Appointment",
                      description: `Book a consultation with ${doc.name}.`,
                      treatmentInterest: doc.name,
                    })
                  }
                />
              ))}
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

// Short degrees for the card, e.g. "MBBS, MD (Medicine), DM (Neurology)" from
// qualification lines like "MBBS - AIIMS, New Delhi".
function shortQualifications(doc) {
  const items = visibleGroups(doc, "qualifications_list").flatMap((g) => g.items);
  const degrees = items.map((q) => q.split(/\s[-–—|]\s|:/)[0].trim()).filter(Boolean);
  return [...new Set(degrees)].join(", ");
}

// Horizontal doctor card: photo on the left; name, designation, speciality,
// qualification, experience and hospital on the right; buttons underneath.
function DoctorCard({ doc, index, onBook }) {
  const to = doctorPath(doc);
  // Under the name: designation. After "Speciality:": the badge (falls back
  // to the speciality). Education: its own admin field, else degrees taken
  // from the qualification list.
  const designation = doc.designation;
  const speciality = doc.badge_title || doc.speciality || parseList(doc.specializations)[0];
  const degrees = String(doc.education || "").trim() || shortQualifications(doc);
  const years = Number(doc.experience_years) || 0;
  const place = [doc.hospital_name, doc.city, doc.country]
    .filter(Boolean)
    .filter((v, i, arr) => i === 0 || !String(arr[0]).toLowerCase().includes(String(v).toLowerCase()))
    .join(", ");

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="flex flex-col bg-white rounded-2xl border border-primary/25 hover:border-primary/60 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-4 sm:p-5"
    >
      <div className="flex gap-4 sm:gap-5">
        {/* Photo */}
        <Link
          to={to}
          aria-label={`View profile of ${doc.name}`}
          className="relative w-28 h-32 sm:w-40 sm:h-44 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 group"
        >
          {doc.photo_url ? (
            <img
              src={doc.photo_url}
              alt={doc.name}
              loading="lazy"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-bold text-primary/25">{doc.name?.[0]}</span>
            </div>
          )}
          {doc.rating > 0 && (
            <span className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/95 text-secondary text-[11px] font-bold shadow">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {Number(doc.rating).toFixed(1)}
            </span>
          )}
        </Link>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <Link to={to} className="group">
            <h3 className="font-heading font-extrabold text-base sm:text-lg leading-snug text-secondary group-hover:text-primary transition-colors line-clamp-2">
              {doc.name}
            </h3>
          </Link>

          {designation && (
            <span className="inline-block max-w-full mt-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-semibold truncate">
              {designation}
            </span>
          )}

          <ul className="mt-2.5 space-y-1.5 text-[13px] sm:text-sm text-foreground/80">
            {speciality && (
              <li className="line-clamp-2">
                <span className="font-bold text-secondary">Speciality:</span> {speciality}
              </li>
            )}
            {degrees && (
              <li className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span className="line-clamp-1">{degrees}</span>
              </li>
            )}
            {years > 0 && (
              <li className="flex items-start gap-2">
                <Hourglass className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>
                  <span className="font-bold text-secondary">{years}+ years</span> of experience
                </span>
              </li>
            )}
            {place && (
              <li className="flex items-start gap-2">
                <Building2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span className="line-clamp-2">{place}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mt-4 pt-0.5 sm:mt-auto sm:pt-4">
        <Link to={to} className="flex-1">
          <Button className="w-full h-10 sm:h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-sm">
            View Profile
          </Button>
        </Link>
        <Button
          onClick={onBook}
          variant="outline"
          className="flex-1 h-10 sm:h-11 rounded-xl border-primary text-primary hover:bg-primary/5 hover:text-primary font-heading font-bold text-sm"
        >
          Book Now
        </Button>
      </div>
    </motion.article>
  );
}