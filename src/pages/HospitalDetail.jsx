import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Bed,
  Users,
  Award,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Activity,
  Shield,
  Building2,
  Car,
  Stethoscope,
  Star,
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
  "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=1600&q=80";

export default function HospitalDetail() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const { openLeadModal } = useLeadModal();

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
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

  const infoStats = [
    { icon: Bed, label: "Beds", value: hospital.beds_count },
    { icon: Users, label: "Doctors", value: hospital.doctors_count || doctorsList.length },
    { icon: Award, label: "Established", value: hospital.established_year },
    { icon: Activity, label: "Rating", value: hospital.rating ? `${hospital.rating}★` : null },
  ].filter((s) => s.value);

  return (
    <div>
      {/* Hero */}
      {/* FIX: pt-28 pb-20 was fixed on every screen size; now scales down on mobile. */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 md:pb-14 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-emerald-900/85" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Link
            to="/hospitals"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-5 sm:mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hospitals
          </Link>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-left">
            {hospital.cover_image_url && (
              <img
                src={hospital.cover_image_url}
                alt={hospital.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0 shadow-lg"
              />
            )}
            <div className="text-white">
              {hospital.hospital_type && (
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
                  {hospital.hospital_type}
                </span>
              )}
              <h1 className="font-heading font-bold text-[clamp(1.5rem,5vw,2.5rem)] mb-2 text-balance">
                {hospital.name}
              </h1>
              <p className="flex items-center justify-center sm:justify-start gap-1 text-white/70 mb-3 text-sm sm:text-base">
                <MapPin className="w-4 h-4 shrink-0" />
                {hospital.address || `${hospital.city}, ${hospital.country}`}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                {hospital.emergency_services && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/20 text-red-300 text-xs font-medium">
                    24/7 Emergency
                  </span>
                )}
                {hospital.parking_available && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                    <Car className="w-3 h-3" /> Parking
                  </span>
                )}
                {hospital.hospital_owner && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                    Chairman: {hospital.hospital_owner}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {infoStats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {infoStats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-2xl p-4 sm:p-6 border text-center">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="font-heading font-bold text-base sm:text-lg">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              {hospital.description && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border">
                  <h2 className="font-heading font-bold text-lg sm:text-xl mb-3">About the Hospital</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{hospital.description}</p>
                </div>
              )}

              {fullDescription.length > 0 && (
                <SectionCard title="About" icon={Building2}>
                  <div className="space-y-3">
                    {fullDescription.map((p, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </SectionCard>
              )}

              {specialities.length > 0 && (
                <SectionCard title="Specialities" icon={Stethoscope}>
                  <div className="flex flex-wrap gap-2">
                    {specialities.map((s, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}

              {doctorsList.length > 0 && (
                <SectionCard title="Our Doctors" icon={Users}>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {doctorsList.map((doc, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" /> {doc}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {facilities.length > 0 && (
                <SectionCard title="Facilities" icon={CheckCircle2}>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {facilities.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {internationalServices.length > 0 && (
                <SectionCard title="International Patient Services" icon={Globe}>
                  <ul className="space-y-2">
                    {internationalServices.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {accreditations.length > 0 && (
                <SectionCard title="Accreditations" icon={Shield}>
                  <div className="flex flex-wrap gap-2">
                    {accreditations.map((a, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 rounded-lg bg-secondary/10 text-secondary text-sm font-semibold border border-secondary/20"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}

              {expertise.length > 0 && (
                <SectionCard title="Area of Expertise" icon={Activity}>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {expertise.map((e, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {e}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {infrastructure.length > 0 && (
                <SectionCard title="Infrastructure Details" icon={Building2}>
                  <ul className="space-y-2">
                    {infrastructure.map((i, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" /> {i}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {awards.length > 0 && (
                <SectionCard title="Awards & Recognition" icon={Award}>
                  <ul className="space-y-2">
                    {awards.map((a, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Award className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" /> {a}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {hospital.google_maps_embed_url && (
                <SectionCard title="Location" icon={MapPin}>
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

            {/* Sidebar */}
            <div>
              <div className="bg-white rounded-2xl p-5 sm:p-6 border lg:sticky lg:top-24 space-y-3.5">
                <h3 className="font-heading font-bold text-base sm:text-lg">Get in Touch</h3>
                {/* FIX: was a <Button> (renders its own <button>) wrapped inside a plain
                    <button> — invalid nested interactive elements. Now a single Button
                    with onClick directly on it. */}
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
            </div>
          </div>

          {/* Doctors at this hospital — real linked Doctor records, shown below
              the hospital details as clickable cards to each doctor's profile. */}
          {doctors.length > 0 && (
            <div className="mt-8 sm:mt-10">
              <h2 className="font-heading font-bold text-xl sm:text-2xl mb-5 sm:mb-6">
                Doctors at {hospital.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {doctors.map((doc) => (
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
                    {doc.experience_years > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{doc.experience_years}+ yrs experience</p>
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

function SectionCard({ title, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-5 sm:p-6 md:p-7 border"
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Icon className="w-5 h-5 text-primary shrink-0" />
        <h2 className="font-heading font-bold text-lg sm:text-xl">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}