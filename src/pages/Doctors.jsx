import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, UserRound, ChevronLeft, ChevronRight, Stethoscope, GraduationCap, Hourglass, Building2, X, SlidersHorizontal } from "lucide-react";
import { db } from "@/api/dataClient";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLeadModal } from "@/lib/LeadModalContext";
import { formatCountApprox } from "@/lib/utils";
import { doctorPath } from "@/lib/paths";
import { SHOW_TURKEY } from "@/lib/siteConfig";
import { visibleGroups } from "@/lib/sectionGroups";
import { DEPARTMENTS, doctorDepartments } from "@/lib/departments";

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
  const [searchParams, setSearchParams] = useSearchParams();
  // Filters applied to the list (shared in the URL) …
  const readFilters = () => ({
    q: searchParams.get("q") || "",
    country: searchParams.get("country") || "all",
    city: searchParams.get("city") || "all",
    department: searchParams.get("department") || "all",
    hospital: searchParams.get("hospital") || "all",
  });
  const applied = readFilters();
  // … and what is picked in the bar but not searched yet.
  const [draft, setDraft] = useState(applied);
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

  // Back/forward or an outside link changing the URL → show those filters.
  const paramsKey = searchParams.toString();
  useEffect(() => {
    setDraft(readFilters());
    setPage(1);
  }, [paramsKey]);

  const runSearch = (next = draft, options) => {
    const params = {};
    if (next.q.trim()) params.q = next.q.trim();
    ["country", "city", "department", "hospital"].forEach((k) => {
      if (next[k] !== "all") params[k] = next[k];
    });
    setSearchParams(params, options);
  };

  // Mobile: the name box searches as you type (the dropdowns live in the
  // Filter popup and apply on "Apply Filters").
  const [filterOpen, setFilterOpen] = useState(false);
  const onMobileQuery = (value) => {
    setDraft((d) => ({ ...d, q: value }));
    runSearch({ ...applied, q: value }, { replace: true });
  };
  const applyMobileFilters = () => {
    runSearch({ ...draft, q: applied.q });
    setFilterOpen(false);
  };
  const activeFilterCount = ["country", "city", "department", "hospital"].filter((k) => applied[k] !== "all").length;
  const clearFilters = () => {
    const empty = { q: "", country: "all", city: "all", department: "all", hospital: "all" };
    setDraft(empty);
    runSearch(empty);
  };
  const hasFilters = paramsKey.length > 0;

  // Picking a country/city/hospital resets the choices below it that may no
  // longer exist (e.g. a city from another country).
  const setDraftField = (key, value) =>
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "country") { next.city = "all"; next.hospital = "all"; }
      if (key === "city") next.hospital = "all";
      return next;
    });

  const filtered = doctors.filter((d) => matches(d, applied));

  // Dropdown options come from the doctors that fit the choices above them.
  const inCountry = doctors.filter((d) => draft.country === "all" || same(d.country, draft.country));
  const inCity = inCountry.filter((d) => draft.city === "all" || same(doctorCity(d), draft.city));
  const inHospital = inCity.filter((d) => draft.hospital === "all" || same(d.hospital_name, draft.hospital));
  const countryOptions = uniqueValues(doctors.map((d) => d.country));
  const cityOptions = uniqueValues(inCountry.map(doctorCity));
  const hospitalOptions = uniqueValues(inCity.map((d) => d.hospital_name));
  const deptCounts = new Map();
  inHospital.forEach((d) => doctorDepartments(d).forEach((n) => deptCounts.set(n, (deptCounts.get(n) || 0) + 1)));
  const known = DEPARTMENTS.map((d) => d.name);
  const departmentOptions = [
    ...known.filter((n) => deptCounts.has(n)),
    ...[...deptCounts.keys()].filter((n) => !known.includes(n)).sort((x, y) => x.localeCompare(y)),
  ];

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          {/* Filters — labelled dropdowns + Search button */}
          {/* Mobile: search box + Filter button (dropdowns open in a popup) */}
          <div className="md:hidden flex items-center gap-2 mb-5">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                value={draft.q}
                onChange={(e) => onMobileQuery(e.target.value)}
                placeholder="Search doctor..."
                className="pl-9 h-11 rounded-xl border border-border bg-white shadow-sm text-foreground"
              />
            </div>
            <Button
              type="button"
              onClick={() => { setDraft(readFilters()); setFilterOpen(true); }}
              className="relative h-11 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold shadow-sm shadow-primary/30 shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 mr-1.5" /> Filter
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-secondary text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 overflow-hidden gap-0 [&>button]:!text-white [&>button]:!bg-transparent [&>button]:opacity-90 [&>button]:top-5">
              <DialogHeader className="bg-secondary px-5 py-4 text-left">
                <DialogTitle className="flex items-center gap-2 font-heading text-lg text-white">
                  <SlidersHorizontal className="w-4 h-4 text-primary" /> Filter Doctors
                </DialogTitle>
                <DialogDescription className="text-white/70 text-xs">Country, city, department ya hospital chunein.</DialogDescription>
              </DialogHeader>
              <div className="p-5 space-y-4">
                <FilterSelect tone="light" label="Country" placeholder="Select Country" value={draft.country} options={countryOptions} onChange={(v) => setDraftField("country", v)} />
                <FilterSelect tone="light" label="City" placeholder="Select City" value={draft.city} options={cityOptions} onChange={(v) => setDraftField("city", v)} />
                <FilterSelect tone="light" label="Department" placeholder="Select Department" value={draft.department} options={departmentOptions} onChange={(v) => setDraftField("department", v)} />
                <FilterSelect tone="light" label="Hospital" placeholder="Select Hospital" value={draft.hospital} options={hospitalOptions} onChange={(v) => setDraftField("hospital", v)} />
              </div>
              <div className="flex items-center justify-between gap-3 px-5 pb-5">
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, country: "all", city: "all", department: "all", hospital: "all" }))}
                  className="text-sm font-semibold text-muted-foreground hover:text-primary"
                >
                  Reset
                </button>
                <Button
                  type="button"
                  onClick={applyMobileFilters}
                  className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold shadow-md shadow-primary/30"
                >
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Tablet & desktop: labelled filter bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); runSearch(); }}
            className="hidden md:block mb-6 sm:mb-8 rounded-2xl bg-secondary p-4 sm:p-5 shadow-lg shadow-secondary/10"
          >
            <div className="grid grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.25fr_1.25fr_auto] gap-x-2.5 gap-y-3 sm:gap-3 lg:gap-3.5 items-end">
              <FilterField label="Doctor Name" className="col-span-2 lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={draft.q}
                    onChange={(e) => setDraftField("q", e.target.value)}
                    placeholder="Search doctor..."
                    className="pl-9 h-11 rounded-xl border-0 bg-white text-foreground"
                  />
                </div>
              </FilterField>
              <FilterSelect label="Country" placeholder="Select Country" value={draft.country} options={countryOptions} onChange={(v) => setDraftField("country", v)} />
              <FilterSelect label="City" placeholder="Select City" value={draft.city} options={cityOptions} onChange={(v) => setDraftField("city", v)} />
              <FilterSelect label="Department" placeholder="Select Department" value={draft.department} options={departmentOptions} onChange={(v) => setDraftField("department", v)} />
              <FilterSelect label="Hospital" placeholder="Select Hospital" value={draft.hospital} options={hospitalOptions} onChange={(v) => setDraftField("hospital", v)} />
              <Button
                type="submit"
                className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold col-span-2 lg:col-span-1"
              >
                <Search className="w-4 h-4 mr-1.5" /> Search
              </Button>
            </div>
          </form>

          {/* Result count + clear */}
          {!loading && (
            <div className="flex items-center justify-between gap-3 -mt-2 sm:-mt-3 mb-4 text-sm text-muted-foreground">
              <p>
                <span className="font-bold text-secondary">{filtered.length}</span> {filtered.length === 1 ? "doctor" : "doctors"} found
              </p>
              {hasFilters && (
                <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>
          )}

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


// ── Filter helpers ──────────────────────────────────────────────────────────
const norm = (v) => String(v || "").trim().toLowerCase();
const same = (a, b) => norm(a) === norm(b);

// City from the doctor's own field, else the last part of "Hospital, City".
function doctorCity(d) {
  if (d.city) return String(d.city).trim();
  const parts = String(d.hospital_name || "").split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "";
}

// Distinct values, case-insensitive, sorted A–Z.
function uniqueValues(list) {
  const seen = new Map();
  list.forEach((v) => {
    const t = String(v || "").trim();
    if (t && !seen.has(norm(t))) seen.set(norm(t), t);
  });
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

function matches(d, f) {
  const q = norm(f.q);
  const matchQ =
    !q ||
    [d.name, d.speciality, d.designation, d.badge_title, d.hospital_name].some((v) => norm(v).includes(q));
  return (
    matchQ &&
    (f.country === "all" || same(d.country, f.country)) &&
    (f.city === "all" || same(doctorCity(d), f.city)) &&
    (f.hospital === "all" || same(d.hospital_name, f.hospital)) &&
    (f.department === "all" || doctorDepartments(d).some((n) => same(n, f.department)))
  );
}

// tone "dark": white labels on the dark filter bar; "light": inside the popup.
function FilterField({ label, children, className = "", tone = "dark" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label
        className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wide mb-1.5 ${
          tone === "light" ? "text-secondary" : "text-white/80"
        }`}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function FilterSelect({ label, placeholder, value, options, onChange, tone = "dark" }) {
  return (
    <FilterField label={label} tone={tone}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`w-full h-11 rounded-xl bg-white text-foreground text-sm px-3 [&>span]:truncate ${
            tone === "light" ? "border border-border focus:ring-primary/30" : "border-0"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterField>
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