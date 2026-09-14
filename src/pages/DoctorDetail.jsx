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
} from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { useLeadModal } from "@/lib/LeadModalContext";
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

  const specializations = parseList(doctor.specializations);
  const treatmentsList = parseList(doctor.treatments_list);
  const overviewPoints = parseList(doctor.overview_points);
  const experienceDetails = parseList(doctor.experience_details);
  const qualificationsList = parseList(doctor.qualifications_list);
  const clinicalFocus = parseList(doctor.clinical_focus);
  const additionalInfo = parseList(doctor.additional_info);
  const researchPubs = parseList(doctor.research_publications);
  const awards = parseList(doctor.awards_achievements);
  const whyChoose = parseList(doctor.why_choose_doctor);

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
            <div className="relative py-10 sm:py-12">
              <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-secondary/90 to-accent-jade/90" />

              {/* Top badges */}
              {doctor.rating > 0 && (
                <span className="absolute top-4 sm:top-5 left-4 sm:left-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs sm:text-sm font-bold text-foreground shadow-sm z-10">
                  {doctor.rating}
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </span>
              )}
              {doctor.experience_years > 0 && (
                <span className="absolute top-4 sm:top-5 right-4 sm:right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs sm:text-sm font-bold text-foreground shadow-sm z-10">
                  <Clock className="w-3.5 h-3.5" />
                  {doctor.experience_years}+ yrs
                </span>
              )}

              <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row gap-5 sm:gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl flex-shrink-0"
                  >
                    {doctor.photo_url ? (
                      <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                        {doctor.name?.[0]}
                      </div>
                    )}
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white">
                    <h1 className="font-heading font-bold text-[clamp(1.4rem,4.5vw,2.5rem)] mb-2 text-balance">
                      {doctor.name}
                    </h1>
                    {doctor.speciality && (
                      <p className="text-[hsl(var(--accent-warm))] text-base sm:text-lg font-medium mb-1">{doctor.speciality}</p>
                    )}
                    {doctor.designation && <p className="text-white/60 mb-3 sm:mb-4 text-sm sm:text-base">{doctor.designation}</p>}
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 text-sm text-white/70">
                      {doctor.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 shrink-0" />
                          {doctor.city}, {doctor.country}
                        </span>
                      )}
                      {doctor.reviews_count > 0 && (
                        <span className="flex items-center gap-1">
                          ({doctor.reviews_count} reviews)
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={contentTopRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              {doctor.overview && (
                <SectionCard title="Overview">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">{doctor.overview}</p>
                  {overviewPoints.length > 0 && (
                    <ul className="space-y-2">
                      {overviewPoints.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              )}

              {treatmentsList.length > 0 && (
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-3">List of Treatments</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {treatmentsList.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/5 border border-secondary/15 rounded-xl px-3.5 py-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {specializations.length > 0 && (
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-3">Specializations</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {specializations.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/5 border border-secondary/15 rounded-xl px-3.5 py-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {doctor.detailed_experience && (
                <SectionCard title="Detailed Experience">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
                    {doctor.detailed_experience}
                  </p>
                  {experienceDetails.length > 0 && (
                    <ul className="space-y-2">
                      {experienceDetails.map((d, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" /> {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              )}

              {qualificationsList.length > 0 && (
                <SectionCard title="Qualifications">
                  <ul className="space-y-2">
                    {qualificationsList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {clinicalFocus.length > 0 && (
                <SectionCard title="Clinical Focus">
                  <ul className="space-y-2">
                    {clinicalFocus.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {additionalInfo.length > 0 && (
                <SectionCard title="Additional Information">
                  <ul className="space-y-3">
                    {additionalInfo.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {researchPubs.length > 0 && (
                <SectionCard title="Research & Publications">
                  <ul className="space-y-2">
                    {researchPubs.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {awards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[hsl(var(--accent-warm))] text-white shrink-0">
                      <Trophy className="w-4.5 h-4.5" />
                    </span>
                    <h2 className="font-heading font-bold text-lg sm:text-xl">Awards & Achievements</h2>
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
              )}

              {whyChoose.length > 0 && (
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-3">Why Choose Dr.?</h2>
                  <div className="space-y-2.5">
                    {whyChoose.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground bg-white border border-border rounded-xl px-4 py-3.5"
                      >
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-jade/15 text-accent-jade shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {doctor.bio && (
                <SectionCard title="About">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {doctor.bio}
                  </p>
                </SectionCard>
              )}
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
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border shadow-lg">
      <h3 className="font-heading font-bold text-base sm:text-lg mb-3 sm:mb-4">Book Consultation</h3>
      {doctor.consultation_fee_usd && (
        <p className="text-xl sm:text-2xl font-bold text-primary mb-4">
          ${doctor.consultation_fee_usd}{" "}
          <span className="text-sm font-normal text-muted-foreground">/ consultation</span>
        </p>
      )}
      <Button
        onClick={() =>
          openLeadModal({
            title: "Book Appointment",
            description: `Book a consultation with ${doctor.name}.`,
            treatmentInterest: doctor.name,
          })
        }
        className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-white rounded-xl gap-2 mb-3"
      >
        <Calendar className="w-4 h-4" /> Book Appointment
      </Button>
      <a
        href={`https://wa.me/919876543210?text=I'd like to consult with ${doctor.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Button variant="outline" className="w-full h-11 rounded-xl gap-2">
          <Phone className="w-4 h-4" /> WhatsApp
        </Button>
      </a>
      {doctor.hospital_name && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-1">Hospital</p>
          <p className="font-medium text-sm sm:text-base">{doctor.hospital_name}</p>
        </div>
      )}
      {doctor.languages && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-1">Languages</p>
          <p className="font-medium text-sm sm:text-base">{doctor.languages}</p>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-secondary/5 rounded-xl p-5 sm:p-6 border-l-4 border-secondary"
    >
      <h2 className="font-heading font-bold text-lg sm:text-xl mb-3 sm:mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}