import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Clock,
  Award,
  Phone,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Trophy,
  BookOpen,
  Info,
  Medal,
  Eye,
  Pill,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Target,
  Building2,
  MessageCircle,
} from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { useLeadModal } from "@/lib/LeadModalContext";
import { useSiteSettings, DEFAULT_SETTINGS, getWhatsAppLink } from "@/hooks/useSiteSettings";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import DetailPageSkeleton from "@/components/common/DetailPageSkeleton";

const parseList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const p = JSON.parse(val);
    return Array.isArray(p) ? p : [];
  } catch {
    return String(val).split(",").map((s) => s.trim()).filter(Boolean);
  }
};

const parseObj = (val) => {
  if (!val) return {};
  if (typeof val === "object" && !Array.isArray(val)) return val;
  try { const p = JSON.parse(val); return p && typeof p === "object" && !Array.isArray(p) ? p : {}; } catch { return {}; }
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516841273335-e39b37888115?w=1600&q=80";

export default function DoctorDetail() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedDoctors, setRelatedDoctors] = useState([]);
  const { openLeadModal } = useLeadModal();

  // The fixed CTA panel should only appear once the two-column content
  // section (marked by this ref) has scrolled up to roughly navbar height —
  // otherwise it floats over the hero before the user scrolls at all.
  const contentTopRef = useRef(null);
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentTopRef.current) return;
      const top = contentTopRef.current.getBoundingClientRect().top;
      setShowFloatingCta(top <= 96);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    db.entities.Doctor.get(id)
      .then(setDoctor)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Related doctors — same speciality first, filled out with same-hospital
  // colleagues if needed, always excluding the doctor currently being viewed.
  useEffect(() => {
    if (!doctor) return;
    Promise.all([
      doctor.speciality
        ? db.entities.Doctor.filter({ status: "active", speciality: doctor.speciality }, "-rating", 20)
        : Promise.resolve([]),
      doctor.hospital_name
        ? db.entities.Doctor.filter({ status: "active", hospital_name: doctor.hospital_name }, "-rating", 20)
        : Promise.resolve([]),
    ])
      .then(([bySpeciality, byHospital]) => {
        const seen = new Set([doctor.id]);
        const combined = [];
        [...bySpeciality, ...byHospital].forEach((d) => {
          if (!seen.has(d.id)) {
            seen.add(d.id);
            combined.push(d);
          }
        });
        setRelatedDoctors(combined.slice(0, 4));
      })
      .catch(() => {});
  }, [doctor]);

  // Sets the browser tab title / SEO meta description only — nothing from
  // this renders anywhere on the visible page. Falls back to sensible
  // auto-generated values when the admin hasn't filled in custom SEO text.
  useDocumentMeta({
    title: doctor
      ? doctor.meta_title || `${doctor.name}${doctor.designation ? ` — ${doctor.designation}` : ""} | AlHind Lifecare`
      : undefined,
    description: doctor ? doctor.meta_description || doctor.overview || undefined : undefined,
  });

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <p className="text-muted-foreground">Doctor not found</p>
        <Link to="/doctors">
          <Button variant="outline">Back to Doctors</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-0">
      {/* Hero */}
      <section className="pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 sm:mb-5 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Doctors
          </Link>

          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            {/* Background image strip — kept thin, just a visible accent above the card */}
            <div className="relative h-16 sm:h-20 md:h-24">
              <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/70 via-secondary/55 to-accent-jade/55" />
            </div>

            {/* Compact info card — uses the site's own muted background */}
            <div className="relative bg-muted -mt-8 sm:-mt-10 mx-3 sm:mx-5 md:mx-6 mb-3 sm:mb-5 rounded-2xl shadow-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-xl overflow-hidden border-4 border-white shadow-md shrink-0 mx-auto sm:mx-0 bg-white"
                >
                  {doctor.photo_url ? (
                    <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                      {doctor.name?.[0]}
                    </div>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="flex items-center gap-2 font-heading font-bold text-base sm:text-lg md:text-xl text-foreground text-balance">
                        {doctor.name}
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent-jade fill-accent-jade/15 shrink-0" />
                      </h1>
                      {(doctor.designation || doctor.speciality) && (
                        <p className="text-accent-jade font-semibold text-sm mt-0.5">
                          {doctor.designation || doctor.speciality}
                        </p>
                      )}
                      {(doctor.hospital_name || doctor.city) && (
                        <p className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1">
                          <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          {doctor.hospital_name}
                          {doctor.hospital_name && doctor.city ? ", " : ""}
                          {doctor.city}
                        </p>
                      )}
                    </div>
                    {doctor.rating > 0 && (
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="w-4 h-4 fill-[hsl(var(--accent-warm))] text-[hsl(var(--accent-warm))]" />
                          <span className="font-heading font-bold text-sm sm:text-base text-foreground">{doctor.rating}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Patient Rating</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stat row — compact, icon + text side by side */}
              {(doctor.experience_years > 0 || parseList(doctor.specializations).length > 0 || doctor.city) && (
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 pt-3 border-t border-border">
                  {doctor.experience_years > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-md bg-accent-jade/10 text-accent-jade shrink-0">
                        <Briefcase className="w-3.5 h-3.5" />
                      </span>
                      <div className="leading-tight">
                        <p className="text-[10px] text-muted-foreground">Experience</p>
                        <p className="font-heading font-bold text-xs sm:text-sm text-foreground">{doctor.experience_years}+</p>
                      </div>
                    </div>
                  )}
                  {parseList(doctor.specializations).length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-md bg-accent-jade/10 text-accent-jade shrink-0">
                        <Medal className="w-3.5 h-3.5" />
                      </span>
                      <div className="leading-tight">
                        <p className="text-[10px] text-muted-foreground">Specializations</p>
                        <p className="font-heading font-bold text-xs sm:text-sm text-foreground">
                          {parseList(doctor.specializations).length}+ areas
                        </p>
                      </div>
                    </div>
                  )}
                  {doctor.city && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-md bg-accent-jade/10 text-accent-jade shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                      <div className="leading-tight">
                        <p className="text-[10px] text-muted-foreground">Location</p>
                        <p className="font-heading font-bold text-xs sm:text-sm text-foreground">{doctor.city}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={contentTopRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              {resolveDoctorSectionConfig(doctor.section_config)
                .filter((s) => s.visible !== false)
                .map((s) => renderDoctorSection(s.key, s.title, doctor))}
            </div>

            {/* Sidebar — mobile/tablet: shown inline here. Desktop: this is
                just a spacer reserving the column width; the actual visible
                card is the fixed panel below (position: sticky was
                unreliable on this site, so it uses the same fixed-panel
                approach as the Navbar). No lead-capture form here on
                purpose — just the two action buttons. */}
            <div className="lg:hidden">
              <DoctorSidebarCard doctor={doctor} openLeadModal={openLeadModal} />
            </div>
            <div className="hidden lg:block" />
          </div>

          {/* Related doctors — same speciality / hospital, shown below the
              doctor's own details. */}
          {relatedDoctors.length > 0 && (
            <div className="mt-8 sm:mt-10">
              <div className="text-center mb-6">
                <h2 className="font-heading font-bold text-xl sm:text-2xl">Related Doctors</h2>
                <p className="text-sm text-muted-foreground mt-1">Explore other specialists in our network</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="group bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <Link to={`/doctors/${doc.id}`} className="block">
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/5 to-secondary/5">
                        {doc.photo_url ? (
                          <img src={doc.photo_url} alt={doc.name} loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary/25">{doc.name?.[0]}</span>
                          </div>
                        )}
                        {doc.rating > 0 && (
                          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-full bg-accent-jade text-white text-[11px] font-bold shadow-sm">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {doc.rating}
                          </span>
                        )}
                        {doc.experience_years > 0 && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-white/95 text-foreground text-[11px] font-bold shadow-sm">
                            {doc.experience_years}+
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {doc.name}
                        </h3>
                        <p className="text-primary text-xs sm:text-sm font-semibold line-clamp-1 mt-0.5">
                          {doc.designation || doc.speciality}
                        </p>
                        {doc.hospital_name && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5 line-clamp-1">
                            <MapPin className="w-3 h-3 shrink-0" /> {doc.hospital_name}
                          </p>
                        )}
                      </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          openLeadModal({
                            title: "Book Appointment",
                            description: `Book a consultation with ${doc.name}.`,
                            treatmentInterest: doc.name,
                          })
                        }
                        className="w-full h-9 rounded-lg text-sm border-accent-jade text-accent-jade hover:bg-accent-jade/5"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link to="/doctors">
                  <Button className="bg-accent-jade hover:bg-accent-jade/90 text-white rounded-xl px-6">
                    View All Doctors
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile-only persistent bottom CTA bar — stays fixed at the bottom of
          the screen the whole time on mobile/tablet. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-3 py-2.5 flex gap-2">
        <Button
          onClick={() =>
            openLeadModal({
              title: "Book Appointment",
              description: `Book a consultation with ${doctor.name}.`,
              treatmentInterest: doctor.name,
            })
          }
          className="flex-1 h-11 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-sm font-heading font-bold gap-2"
        >
          <Calendar className="w-4 h-4" /> Book Appointment
        </Button>
        <a
          href={`https://wa.me/919876543210?text=I'd like to consult with ${doctor.name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="h-11 w-11 shrink-0 rounded-xl p-0" aria-label="WhatsApp">
            <Phone className="w-5 h-5" />
          </Button>
        </a>
      </div>

      {/* Desktop-only fixed panel — hidden until contentTopRef has scrolled
          up near the navbar (so it never floats over the hero), then stays
          visible throughout the rest of the scroll. */}
      <div
        className={`hidden lg:block fixed top-24 inset-x-0 z-30 pointer-events-none transition-opacity duration-300 ${
          showFloatingCta ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-end">
            <div className={`w-full lg:w-[calc(33.333%-1rem)] ${showFloatingCta ? "pointer-events-auto" : "pointer-events-none"}`}>
              <DoctorSidebarCard doctor={doctor} openLeadModal={openLeadModal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorSidebarCard({ doctor, openLeadModal }) {
  const { data: settings = DEFAULT_SETTINGS } = useSiteSettings();
  const waLink = getWhatsAppLink(settings.whatsapp_number);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() =>
          openLeadModal({
            title: "Book Appointment",
            description: `Book a consultation with ${doctor.name}.`,
            treatmentInterest: doctor.name,
          })
        }
        className="h-12 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-base font-heading font-bold shadow-lg"
      >
        Book Appointment
      </Button>
      {settings.whatsapp_number && (
        <Button variant="outline" asChild className="h-12 rounded-xl gap-2 text-base font-heading font-semibold bg-white shadow-lg">
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </Button>
      )}
    </div>
  );
}

// The built-in order and titles for every section on a doctor's detail
// page. Admins can override order/title/visibility per doctor via the
// "Section Order & Titles" editor in the admin form (stored in
// doctor.section_config) — this is just the fallback.
// A themed icon + color for every checklist section on a doctor's page.
const SECTION_ICON_THEME = {
  overview: { icon: Eye, bg: "bg-blue-100", color: "text-blue-500" },
  treatments_list: { icon: Pill, bg: "bg-indigo-100", color: "text-indigo-500" },
  specializations: { icon: Stethoscope, bg: "bg-teal-100", color: "text-teal-600" },
  detailed_experience: { icon: Briefcase, bg: "bg-amber-100", color: "text-amber-600" },
  qualifications_list: { icon: GraduationCap, bg: "bg-violet-100", color: "text-violet-500" },
  clinical_focus: { icon: Target, bg: "bg-orange-100", color: "text-orange-500" },
  additional_info: { icon: Info, bg: "bg-sky-100", color: "text-sky-500" },
  research_publications: { icon: BookOpen, bg: "bg-cyan-100", color: "text-cyan-600" },
};

export const DEFAULT_DOCTOR_SECTIONS = [
  { key: "overview", title: "Overview" },
  { key: "treatments_list", title: "List of Treatments" },
  { key: "specializations", title: "Specializations" },
  { key: "detailed_experience", title: "Detailed Experience" },
  { key: "qualifications_list", title: "Qualifications" },
  { key: "clinical_focus", title: "Clinical Focus" },
  { key: "additional_info", title: "Additional Information" },
  { key: "research_publications", title: "Research & Publications" },
  { key: "awards_achievements", title: "Awards & Achievements" },
  { key: "why_choose_doctor", title: "Why Choose Dr.?" },
  { key: "bio", title: "About" },
];

function resolveDoctorSectionConfig(raw) {
  const saved = parseList(raw);
  if (saved.length === 0) return DEFAULT_DOCTOR_SECTIONS.map((s) => ({ ...s, visible: true }));
  const known = new Set(saved.map((s) => s.key));
  const missing = DEFAULT_DOCTOR_SECTIONS.filter((s) => !known.has(s.key)).map((s) => ({ ...s, visible: true }));
  return [...saved, ...missing];
}

// Renders one section's content for the given key, or null if there's
// nothing to show — the caller filters out the nulls.
function renderDoctorSection(key, title, doctor) {
  if (key === "overview") {
    if (!doctor.overview) return null;
    const points = parseList(doctor.overview_points);
    const theme = SECTION_ICON_THEME.overview;
    return (
      <SectionCard key={key} title={title} subheading={parseObj(doctor.section_subheadings)[key]}>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">{doctor.overview}</p>
        {points.length > 0 && (
          <ul className="space-y-2">
            {points.map((p, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full ${theme.bg} ${theme.color} flex-shrink-0`}>
                  <theme.icon className="w-3.5 h-3.5" />
                </span>
                <span className="pt-0.5">{p}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    );
  }

  if (key === "treatments_list" || key === "specializations") {
    const items = parseList(doctor[key]);
    if (items.length === 0) return null;
    const subheading = parseObj(doctor.section_subheadings)[key];
    const theme = SECTION_ICON_THEME[key];
    return (
      <div key={key}>
        <h2 className="font-heading font-bold text-lg sm:text-xl mb-1">{title}</h2>
        {subheading && <p className="font-bold text-base text-foreground/70 mb-3">{subheading}</p>}
        {!subheading && <div className="mb-2 sm:mb-3" />}
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((t, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-sm text-muted-foreground bg-secondary/5 border border-secondary/15 rounded-xl px-3.5 py-3">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full ${theme.bg} ${theme.color} flex-shrink-0`}>
                <theme.icon className="w-3.5 h-3.5" />
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (key === "detailed_experience") {
    if (!doctor.detailed_experience) return null;
    const points = parseList(doctor.experience_details);
    const theme = SECTION_ICON_THEME.detailed_experience;
    return (
      <SectionCard key={key} title={title} subheading={parseObj(doctor.section_subheadings)[key]}>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">{doctor.detailed_experience}</p>
        {points.length > 0 && (
          <ul className="space-y-2">
            {points.map((d, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full ${theme.bg} ${theme.color} flex-shrink-0`}>
                  <theme.icon className="w-3.5 h-3.5" />
                </span>
                <span className="pt-0.5">{d}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    );
  }

  if (key === "qualifications_list" || key === "clinical_focus") {
    const items = parseList(doctor[key]);
    if (items.length === 0) return null;
    const theme = SECTION_ICON_THEME[key];
    return (
      <SectionCard key={key} title={title} subheading={parseObj(doctor.section_subheadings)[key]}>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full ${theme.bg} ${theme.color} flex-shrink-0`}>
                <theme.icon className="w-3.5 h-3.5" />
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    );
  }

  if (key === "additional_info") {
    const items = parseList(doctor.additional_info);
    if (items.length === 0) return null;
    const theme = SECTION_ICON_THEME.additional_info;
    return (
      <SectionCard key={key} title={title} subheading={parseObj(doctor.section_subheadings)[key]}>
        <ul className="space-y-2.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full ${theme.bg} ${theme.color} flex-shrink-0`}>
                <theme.icon className="w-3.5 h-3.5" />
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    );
  }

  if (key === "research_publications") {
    const items = parseList(doctor.research_publications);
    if (items.length === 0) return null;
    const theme = SECTION_ICON_THEME.research_publications;
    return (
      <SectionCard key={key} title={title} subheading={parseObj(doctor.section_subheadings)[key]}>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full ${theme.bg} ${theme.color} flex-shrink-0`}>
                <theme.icon className="w-3.5 h-3.5" />
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    );
  }

  if (key === "awards_achievements") {
    const awards = parseList(doctor.awards_achievements);
    if (awards.length === 0) return null;
    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[hsl(var(--accent-warm))] text-white shrink-0">
            <Trophy className="w-4.5 h-4.5" />
          </span>
          <div>
            <h2 className="font-heading font-bold text-lg sm:text-xl">{title}</h2>
            {parseObj(doctor.section_subheadings).awards_achievements && (
              <p className="font-bold text-sm text-foreground/70">{parseObj(doctor.section_subheadings).awards_achievements}</p>
            )}
          </div>
        </div>
        <ul className="space-y-2.5">
          {awards.map((a, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground bg-white/70 rounded-lg px-3.5 py-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--accent-warm)/0.15)] text-[hsl(var(--accent-warm))] shrink-0">
                <Medal className="w-3.5 h-3.5" />
              </span>
              {a}
            </li>
          ))}
        </ul>
        {doctor.award_document_url && (
          <a
            href={doctor.award_document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-medium hover:underline"
          >
            <Award className="w-4 h-4" /> View Certificate/Document
          </a>
        )}
        <p className="flex items-center gap-1.5 justify-center mt-4 pt-4 border-t border-amber-200/70 text-xs font-medium text-[hsl(var(--accent-warm))]">
          <Trophy className="w-3.5 h-3.5" /> {awards.length} Professional Achievement{awards.length !== 1 ? "s" : ""}
        </p>
      </motion.div>
    );
  }

  if (key === "why_choose_doctor") {
    const items = parseList(doctor.why_choose_doctor);
    if (items.length === 0) return null;
    const subheading = parseObj(doctor.section_subheadings)[key];
    return (
      <div key={key}>
        <h2 className="font-heading font-bold text-lg sm:text-xl mb-1">{title}</h2>
        {subheading && <p className="font-bold text-base text-foreground/70 mb-3">{subheading}</p>}
        {!subheading && <div className="mb-2 sm:mb-3" />}
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground bg-white border border-border rounded-xl px-4 py-3.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-jade/15 text-accent-jade shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (key === "bio") {
    if (!doctor.bio) return null;
    return (
      <SectionCard key={key} title={title} subheading={parseObj(doctor.section_subheadings)[key]}>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{doctor.bio}</p>
      </SectionCard>
    );
  }

  return null;
}

function SectionCard({ title, subheading, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-secondary/5 rounded-xl p-5 sm:p-6 border-l-4 border-secondary"
    >
      <h2 className="font-heading font-bold text-lg sm:text-xl mb-1">{title}</h2>
      {subheading && <p className="font-bold text-base text-foreground/70 mb-3">{subheading}</p>}
      {!subheading && <div className="mb-2 sm:mb-3" />}
      {children}
    </motion.div>
  );
}