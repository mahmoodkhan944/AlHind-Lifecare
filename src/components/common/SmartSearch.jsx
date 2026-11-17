import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { flushSync } from "react-dom";
import { Search, X, Stethoscope, Building2, Heart, Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "@/api/dataClient";
import { treatmentUrl } from "@/lib/slugify";
import { useQuery } from "@tanstack/react-query";
import { doctorPath } from "@/lib/paths";

/**
 * variant "icon" (default): a search icon that opens a box under the header.
 * variant "inline": a search field shown right in the menu bar, with results
 * dropping down under it.
 */
export default function SmartSearch({ scrolled, variant = "icon" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const enabled = query.trim().length >= 2;
  const q = query.toLowerCase().trim();

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["search-doctors"],
    queryFn: () => db.entities.Doctor.filter({ status: "active" }, "-created_date", 200),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const { data: hospitals = [], isLoading: loadingHospitals } = useQuery({
    queryKey: ["search-hospitals"],
    queryFn: () => db.entities.Hospital.filter({ status: "active" }, "-created_date", 200),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const { data: treatments = [], isLoading: loadingTreatments } = useQuery({
    queryKey: ["search-treatments"],
    queryFn: () => db.entities.Treatment.filter({ status: "active" }, "-created_date", 200),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const matchedDoctors = enabled
    ? doctors.filter((d) => (d.name || "").toLowerCase().includes(q) || (d.speciality || "").toLowerCase().includes(q)).slice(0, 4)
    : [];
  const matchedHospitals = enabled
    ? hospitals.filter((h) => (h.name || "").toLowerCase().includes(q) || (h.city || "").toLowerCase().includes(q)).slice(0, 4)
    : [];
  const matchedTreatments = enabled
    ? treatments.filter((t) => (t.name || "").toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q)).slice(0, 4)
    : [];

  const hasResults = matchedDoctors.length + matchedHospitals.length + matchedTreatments.length > 0;
  // FIX: was `enabled && loadingDoctors` only — hospitals/treatments loading state was
  // never checked, so the search could flash "no results" or partial results while
  // those two queries were still in flight.
  const loading = enabled && (loadingDoctors || loadingHospitals || loadingTreatments);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close the box right away (flushSync), before navigating: otherwise, when
  // the next page's code is still loading, the close got held back with the
  // navigation and the box stayed open over the new page.
  const go = (path) => {
    flushSync(() => {
      setOpen(false);
      setQuery("");
    });
    navigate(path);
  };

  // Any page change (result click, back button, link) closes the search.
  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [location.pathname]);

  // Enter opens the first result.
  const firstPath =
    (matchedDoctors[0] && doctorPath(matchedDoctors[0])) ||
    (matchedHospitals[0] && `/hospitals/${matchedHospitals[0].id}`) ||
    (matchedTreatments[0] && treatmentUrl(matchedTreatments[0]));

  const onKeyDown = (e) => {
    if (e.key === "Enter" && firstPath) {
      e.preventDefault();
      go(firstPath);
    }
  };

  const resultsBody = (
    <div className="max-h-[60vh] overflow-y-auto">
      {loading && (
        <div className="p-6 text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
        </div>
      )}
      {!loading && enabled && !hasResults && (
        <div className="p-6 text-center text-sm text-gray-400">
          No results found for "{query}"
        </div>
      )}
      {!loading && !enabled && (
        <div className="p-6 text-center text-sm text-gray-400">
          Type at least 2 characters to search across doctors, hospitals, and treatments
        </div>
      )}
      {!loading && hasResults && (
        <div className="py-2">
          {matchedDoctors.length > 0 && (
            <ResultGroup icon={Stethoscope} title="Doctors" items={matchedDoctors.map((d) => ({ label: d.name, sub: d.speciality, path: doctorPath(d) }))} onItemClick={go} />
          )}
          {matchedHospitals.length > 0 && (
            <ResultGroup icon={Building2} title="Hospitals" items={matchedHospitals.map((h) => ({ label: h.name, sub: h.city, path: `/hospitals/${h.id}` }))} onItemClick={go} />
          )}
          {matchedTreatments.length > 0 && (
            <ResultGroup icon={Heart} title="Treatments" items={matchedTreatments.map((t) => ({ label: t.name, sub: t.category, path: treatmentUrl(t) }))} onItemClick={go} />
          )}
        </div>
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <InlineSearch
        query={query}
        setQuery={setQuery}
        open={open}
        setOpen={setOpen}
        onKeyDown={onKeyDown}
        resultsBody={resultsBody}
      />
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${scrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
        aria-label="Search"
      >
        {open ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </button>

      {/* No exit animation on purpose: when a result opens a page whose code
          is still loading, the exit animation got stuck and left the box
          (with the old text) on screen. */}
      {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 md:top-20 left-0 right-0 z-50 px-4"
            >
              <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Search doctors, hospitals, treatments..."
                    className="flex-1 text-sm outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {resultsBody}
              </div>
            </motion.div>
          </>
      )}
    </>
  );
}

// Search field that sits in the menu bar; results drop down under it.
function InlineSearch({ query, setQuery, open, setOpen, onKeyDown, resultsBody }) {
  const boxRef = useRef(null);
  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [setOpen]);

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex items-center gap-2 h-8 pl-3.5 pr-2 rounded-full bg-white/95 border border-white/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/40 transition">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search doctors, hospitals, treatments..."
          aria-label="Search doctors, hospitals, treatments"
          className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-900 placeholder-gray-500"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} className="text-gray-400 hover:text-primary" aria-label="Clear search">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="w-4 h-4 text-secondary/70 shrink-0" />
        )}
      </div>
      {open && query.trim() && (
        <div className="absolute right-0 top-full mt-2 w-[min(420px,90vw)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {resultsBody}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ icon: Icon, title, items, onItemClick }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </div>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onItemClick(item.path)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{item.label}</p>
            {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
        </button>
      ))}
    </div>
  );
}