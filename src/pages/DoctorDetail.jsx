import React, { useState, useEffect } from "react";
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
  Activity,
  Trophy,
  BookOpen,
  Stethoscope,
} from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { useLeadModal } from "@/lib/LeadModalContext";

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
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

  const sections = [
    { title: "Qualifications", icon: BookOpen, items: qualificationsList },
    { title: "Clinical Focus", icon: Activity, items: clinicalFocus },
    { title: "Additional Information", icon: CheckCircle2, items: additionalInfo },
    { title: "Research & Publications", icon: BookOpen, items: researchPubs },
    { title: "Why Choose This Doctor", icon: CheckCircle2, items: whyChoose },
  ].filter((s) => s.items.length > 0);

  return (
    <div>
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

            {/* Side "Get Free Quote" tab */}
            <button
              onClick={() => openLeadModal({ title: "Book Appointment", treatmentInterest: doctor.name })}
              className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center justify-center px-2.5 py-6 rounded-l-xl bg-primary hover:bg-primary/90 text-white shadow-lg transition-colors"
            >
              <span
                className="font-heading font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                Get Free Quote
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              {doctor.overview && (
                <SectionCard title="Overview" icon={Activity}>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{doctor.overview}</p>
                  {overviewPoints.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {overviewPoints.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              )}

              {doctor.detailed_experience && (
                <SectionCard title="Detailed Experience" icon={Clock}>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {doctor.detailed_experience}
                  </p>
                  {experienceDetails.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {experienceDetails.map((d, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" /> {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              )}

              {specializations.length > 0 && (
                <SectionCard title="Specializations" icon={Stethoscope}>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((s, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}

              {treatmentsList.length > 0 && (
                <SectionCard title="Treatments Offered" icon={Activity}>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {treatmentsList.map((t, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" /> {t}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {sections.map((section) => (
                <SectionCard key={section.title} title={section.title} icon={section.icon}>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              ))}

              {awards.length > 0 && (
                <SectionCard title="Awards & Achievements" icon={Trophy} accent>
                  <ul className="space-y-2">
                    {awards.map((a, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Trophy className="w-4 h-4 text-[hsl(var(--accent-warm))] flex-shrink-0 mt-0.5" /> {a}
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
                </SectionCard>
              )}

              {doctor.bio && (
                <SectionCard title="About" icon={BookOpen}>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {doctor.bio}
                  </p>
                </SectionCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border lg:sticky lg:top-24">
                <h3 className="font-heading font-bold text-base sm:text-lg mb-3 sm:mb-4">Book Consultation</h3>
                {doctor.consultation_fee_usd && (
                  <p className="text-xl sm:text-2xl font-bold text-primary mb-4">
                    ${doctor.consultation_fee_usd}{" "}
                    <span className="text-sm font-normal text-muted-foreground">/ consultation</span>
                  </p>
                )}
                {/* FIX: was a <Button> (which renders its own <button>) wrapped inside
                    a plain <button> — nested interactive elements are invalid HTML and
                    can cause inconsistent click/focus behavior across browsers. */}
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
            </div>
          </div>

          {/* Related doctors — same speciality / hospital, shown below the
              doctor's own details. */}
          {relatedDoctors.length > 0 && (
            <div className="mt-8 sm:mt-10">
              <h2 className="font-heading font-bold text-xl sm:text-2xl mb-5 sm:mb-6">Related Doctors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedDoctors.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/doctors/${doc.id}`}
                    className="group flex flex-col items-center text-center bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6"
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 ring-4 ring-white shadow-md">
                        {doc.photo_url ? (
                          <img src={doc.photo_url} alt={doc.name} loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary/25">{doc.name?.[0]}</span>
                          </div>
                        )}
                      </div>
                      {doc.rating > 0 && (
                        <span className="absolute -top-1 -left-1 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-md">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          {doc.rating}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {doc.name}
                    </h3>
                    <p className="text-primary text-xs sm:text-sm font-semibold line-clamp-1">{doc.speciality}</p>
                    {doc.hospital_name && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{doc.hospital_name}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionCard({ title, icon: Icon, accent, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-2xl p-5 sm:p-6 md:p-7 border ${accent ? "bg-[hsl(var(--accent-warm)/0.08)] border-[hsl(var(--accent-warm)/0.3)]" : "bg-white border-border"}`}
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Icon className={`w-5 h-5 shrink-0 ${accent ? "text-[hsl(var(--accent-warm))]" : "text-primary"}`} />
        <h2 className="font-heading font-bold text-lg sm:text-xl">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}