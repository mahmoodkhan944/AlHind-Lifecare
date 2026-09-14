import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Bed,
  Award,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Activity,
  Building2,
  Star,
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
  "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=1600&q=80";

export default function HospitalDetail() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
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
    db.entities.Hospital.get(id)
      .then(setHospital)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Doctors that work at this hospital — matched by hospital name, shown below
  // the hospital details as clickable cards linking to each doctor's profile.
  useEffect(() => {
    if (!hospital?.name) return;
    db.entities.Doctor.filter({ status: "active", hospital_name: hospital.name }, "-rating", 100)
      .then(setDoctors)
      .catch(() => {});
  }, [hospital?.name]);

  // Sets the browser tab title / SEO meta description only — nothing from
  // this renders anywhere on the visible page.
  useDocumentMeta({
    title: hospital
      ? hospital.meta_title || `${hospital.name}${hospital.city ? ` — ${hospital.city}` : ""} | AlHind Lifecare`
      : undefined,
    description: hospital ? hospital.meta_description || hospital.description || undefined : undefined,
  });

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!hospital) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <p className="text-muted-foreground">Hospital not found</p>
        <Link to="/hospitals">
          <Button variant="outline">Back to Hospitals</Button>
        </Link>
      </div>
    );
  }

  const fullDescription = parseList(hospital.full_description);
  const specialities = parseList(hospital.specialities);
  const doctorsList = parseList(hospital.doctors_list);
  const facilities = parseList(hospital.facilities);
  const internationalServices = parseList(hospital.international_patient_services);
  const accreditations = parseList(hospital.accreditations);
  const expertise = parseList(hospital.area_of_expertise);
  const infrastructure = parseList(hospital.infrastructure_details);
  const awards = parseList(hospital.awards);

  return (
    <div className="pb-20 lg:pb-0">
      {/* Hero */}
      <section className="pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            to="/hospitals"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 sm:mb-5 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hospitals
          </Link>

          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[26rem] sm:h-[28rem]">
              <img
                src={hospital.cover_image_url || HERO_IMAGE}
                alt={hospital.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

              {/* Top badges */}
              {hospital.hospital_type && (
                <span className="absolute top-4 sm:top-5 left-4 sm:left-5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs sm:text-sm font-semibold text-foreground shadow-sm">
                  {hospital.hospital_type}
                </span>
              )}
              {hospital.rating && (
                <span className="absolute top-4 sm:top-5 right-4 sm:right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs sm:text-sm font-bold text-foreground shadow-sm">
                  {hospital.rating}
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </span>
              )}

              {/* Bottom overlay content */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                <h1 className="font-heading font-extrabold text-[clamp(1.4rem,4.5vw,2.5rem)] mb-2 text-balance">
                  {hospital.name}
                </h1>
                <p className="flex items-center gap-1.5 text-white/85 mb-4 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {hospital.address || `${hospital.city}, ${hospital.country}`}
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t border-white/20">
                  {hospital.established_year && (
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-accent-warm" />
                      <div>
                        <p className="text-[11px] sm:text-xs text-white/70">Established</p>
                        <p className="font-heading font-bold text-sm sm:text-base">{hospital.established_year}</p>
                      </div>
                    </div>
                  )}
                  {(hospital.emergency_services || hospital.parking_available) && (
                    <div className="flex items-start gap-2">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-accent-warm" />
                      <div>
                        <p className="text-[11px] sm:text-xs text-white/70">Services</p>
                        <p className="font-heading font-bold text-sm sm:text-base leading-tight">
                          {[hospital.emergency_services && "24/7 Emergency", hospital.parking_available && "Parking"]
                            .filter(Boolean)
                            .join(" | ")}
                        </p>
                      </div>
                    </div>
                  )}
                  {hospital.beds_count > 0 && (
                    <div className="flex items-start gap-2">
                      <Bed className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-accent-warm" />
                      <div>
                        <p className="text-[11px] sm:text-xs text-white/70">Capacity</p>
                        <p className="font-heading font-bold text-sm sm:text-base">{hospital.beds_count} beds</p>
                      </div>
                    </div>
                  )}
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
              {(hospital.description || fullDescription.length > 0) && (
                <SectionCard title={`About ${hospital.name}`}>
                  {hospital.description && (
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
                      {hospital.description}
                    </p>
                  )}
                  {fullDescription.length > 0 && (
                    <div className="space-y-3">
                      {fullDescription.map((p, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                </SectionCard>
              )}

              {specialities.length > 0 && (
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-3">
                    Medical Specialties Available At {hospital.name}
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {specialities.map((s, idx) => (
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

              {doctorsList.length > 0 && (
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-0.5">Doctor's List</h2>
                  <p className="text-sm text-muted-foreground mb-3">Our team of expert medical professionals</p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {doctorsList.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/5 border border-secondary/15 rounded-xl px-3.5 py-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" /> {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(facilities.length > 0 || internationalServices.length > 0) && (
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-3">Facilities &amp; Patient Services</h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[...facilities, ...internationalServices].map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/5 border border-secondary/15 rounded-xl px-3.5 py-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {accreditations.length > 0 && (
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-0.5">Accreditations &amp; Certifications</h2>
                  <p className="text-sm text-muted-foreground mb-3">Recognized for excellence in healthcare quality and safety</p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {accreditations.map((a, idx) => (
                      <div key={idx} className="relative bg-white border border-border rounded-xl border-t-4 border-t-secondary px-4 py-3.5">
                        <Star className="absolute top-3 right-3 w-4 h-4 text-secondary/20" />
                        <p className="font-heading font-bold text-sm text-foreground pr-5">{a}</p>
                        <p className="flex items-center gap-1 text-xs text-secondary font-medium mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Certified Excellence
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-heading font-bold text-sm text-foreground mb-0.5">Quality Commitment</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Our accreditations demonstrate our commitment to providing the highest standards of patient
                        care, safety protocols, and clinical excellence. We undergo rigorous evaluations to maintain
                        these certifications.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {expertise.length > 0 && (
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-3">Area of Expertise</h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {expertise.map((e, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/5 border border-secondary/15 rounded-xl px-3.5 py-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" /> {e}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {infrastructure.length > 0 && (
                <div>
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-3">Infrastructure Details</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {infrastructure.map((i, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/5 border border-secondary/15 rounded-xl px-3.5 py-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" /> {i}
                      </div>
                    ))}
                  </div>
                </div>
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
                      <Award className="w-4.5 h-4.5" />
                    </span>
                    <h2 className="font-heading font-bold text-lg sm:text-xl">Awards &amp; Recognition</h2>
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
                </motion.div>
              )}

              {hospital.google_maps_embed_url && (
                <SectionCard title="Location">
                  <div className="rounded-xl overflow-hidden border">
                    <iframe
                      src={hospital.google_maps_embed_url}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Hospital Location"
                    />
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Sidebar — mobile/tablet: shown inline here. Desktop: this is
                just a spacer reserving the column width; the actual visible
                card is the fixed panel below. No lead-capture form here on
                purpose — just the two action buttons. */}
            <div className="lg:hidden">
              <HospitalSidebarCard hospital={hospital} openLeadModal={openLeadModal} />
            </div>
            <div className="hidden lg:block" />
          </div>

          {/* Doctors at this hospital — real linked Doctor records, shown below
              the hospital details as clickable cards to each doctor's profile. */}
          {doctors.length > 0 && (
            <div className="mt-8 sm:mt-10">
              <div className="text-center mb-6">
                <h2 className="font-heading font-bold text-xl sm:text-2xl">Top Doctors</h2>
                <p className="text-sm text-muted-foreground mt-1">Highly skilled doctors at {hospital.name}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {doctors.map((doc) => (
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
              title: "Request Appointment",
              description: `Request an appointment at ${hospital.name}.`,
              treatmentInterest: hospital.name,
            })
          }
          className="flex-1 h-11 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-sm font-heading font-bold gap-2"
        >
          <Calendar className="w-4 h-4" /> Request Appointment
        </Button>
        <a
          href={`https://wa.me/919876543210?text=I'm interested in ${hospital.name}`}
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
              <HospitalSidebarCard hospital={hospital} openLeadModal={openLeadModal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HospitalSidebarCard({ hospital, openLeadModal }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border shadow-lg space-y-3.5">
      <h3 className="font-heading font-bold text-base sm:text-lg">Get in Touch</h3>
      <Button
        onClick={() =>
          openLeadModal({
            title: "Request Appointment",
            description: `Request an appointment at ${hospital.name}.`,
            treatmentInterest: hospital.name,
          })
        }
        className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-white rounded-xl gap-2"
      >
        <Calendar className="w-4 h-4" /> Request Appointment
      </Button>
      <a
        href={`https://wa.me/919876543210?text=I'm interested in ${hospital.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Button variant="outline" className="w-full h-11 rounded-xl gap-2">
          <Phone className="w-4 h-4" /> WhatsApp
        </Button>
      </a>
      {hospital.contact_email && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground pt-3.5 border-t break-all">
          <Mail className="w-4 h-4 shrink-0" />
          {hospital.contact_email}
        </p>
      )}
      {hospital.contact_phone && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4 shrink-0" />
          {hospital.contact_phone}
        </p>
      )}
      {hospital.website && (
        <a
          href={hospital.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Globe className="w-4 h-4 shrink-0" />
          Visit Website
        </a>
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