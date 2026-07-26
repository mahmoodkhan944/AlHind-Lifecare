import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  TrendingUp,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Activity,
  AlertTriangle,
  Heart,
  Star,
  MapPin,
  Bed,
  Building2,
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
    return [];
  }
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1758691461957-474a7686e388?w=1600&q=80";

export default function TreatmentDetail() {
  const { id } = useParams();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedDoctors, setRelatedDoctors] = useState([]);
  const [relatedHospitals, setRelatedHospitals] = useState([]);
  const { openLeadModal } = useLeadModal();

  useEffect(() => {
    db.entities.Treatment.get(id)
      .then(setTreatment)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Related doctors — same speciality as this treatment's category.
  useEffect(() => {
    if (!treatment?.category) return;
    db.entities.Doctor.filter({ status: "active", speciality: treatment.category }, "-rating", 4)
      .then(setRelatedDoctors)
      .catch(() => {});
  }, [treatment?.category]);

  // Related hospitals — those listing this treatment's category among their
  // specialities. Hospital specialities are stored as a JSON list, so this
  // filter has to happen client-side after a broader fetch.
  useEffect(() => {
    if (!treatment?.category) return;
    db.entities.Hospital.filter({ status: "active" }, "-rating", 200)
      .then((hospitals) => {
        const matches = hospitals.filter((h) => parseList(h.specialities).includes(treatment.category));
        setRelatedHospitals(matches.slice(0, 4));
      })
      .catch(() => {});
  }, [treatment?.category]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <p className="text-muted-foreground">Treatment not found</p>
        <Link to="/treatments">
          <Button variant="outline">Back to Treatments</Button>
        </Link>
      </div>
    );
  }

  const infoCards = [
    { icon: DollarSign, label: "Cost Range", value: treatment.cost_range_usd },
    { icon: Clock, label: "Duration", value: treatment.duration },
    { icon: TrendingUp, label: "Success Rate", value: treatment.success_rate },
    { icon: RefreshCw, label: "Recovery Time", value: treatment.recovery_time },
  ].filter((c) => c.value);

  const sections = [
    { key: "overview", title: "Overview", icon: Activity },
    { key: "signs_symptoms", title: "Signs & Symptoms", icon: AlertTriangle },
    { key: "related_conditions", title: "Related Conditions", icon: Heart },
    { key: "diagnosis", title: "Diagnosis", icon: Activity },
    { key: "treatment_types", title: "Types of Treatment", icon: CheckCircle2 },
    { key: "surgery_types", title: "Types of Surgery", icon: CheckCircle2 },
    { key: "how_its_done", title: "How It's Done", icon: Activity },
    { key: "purpose", title: "Purpose", icon: CheckCircle2 },
    { key: "recovery_details", title: "Recovery", icon: RefreshCw },
    { key: "risks", title: "Risks & Complications", icon: AlertTriangle },
    { key: "summary", title: "Summary", icon: CheckCircle2 },
    { key: "why_choose_india", title: "Why Choose India", icon: Heart },
  ];

  const listSections = sections
    .map((s) => ({ ...s, items: parseList(treatment[s.key]) }))
    .filter((s) => s.items.length > 0);

  const keyBenefits = parseList(treatment.key_benefits);
  const procedures = parseList(treatment.treatment_procedures);
  const additionalInfo = parseList(treatment.additional_information);

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
            to="/treatments"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-5 sm:mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Treatments
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {treatment.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-4">
                {treatment.category}
              </span>
            )}
            <h1 className="font-heading font-bold text-[clamp(1.6rem,5.5vw,3rem)] text-white mb-3 sm:mb-4 leading-tight text-balance">
              {treatment.name}
            </h1>
            {treatment.description && (
              <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl text-balance">
                {treatment.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {infoCards.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {infoCards.map(({ icon: Icon, label, value }) => (
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
              {treatment.image_url && (
                <img
                  src={treatment.image_url}
                  alt={treatment.name}
                  className="w-full h-52 sm:h-64 md:h-72 object-cover rounded-2xl shadow-lg"
                />
              )}

              {treatment.detailed_content && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border">
                  <h2 className="font-heading font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">
                    About {treatment.name}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {treatment.detailed_content}
                  </p>
                </div>
              )}

              {keyBenefits.length > 0 && (
                <SectionCard title="Key Benefits" icon={CheckCircle2}>
                  <ul className="space-y-2">
                    {keyBenefits.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {listSections.map((section) => (
                <SectionCard key={section.key} title={section.title} icon={section.icon}>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              ))}

              {procedures.length > 0 && (
                <SectionCard title="Treatment Procedures" icon={Activity}>
                  <ol className="space-y-3">
                    {procedures.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-muted-foreground pt-1">{item}</p>
                      </li>
                    ))}
                  </ol>
                </SectionCard>
              )}

              {additionalInfo.length > 0 && (
                <SectionCard title="Additional Information" icon={CheckCircle2}>
                  <ul className="space-y-2">
                    {additionalInfo.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {treatment.gvhd_info && (
                <SectionCard title="GVHD Information" icon={Activity}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{treatment.gvhd_info}</p>
                </SectionCard>
              )}
              {treatment.gvhd_symptoms && (
                <SectionCard title="GVHD Symptoms" icon={AlertTriangle}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{treatment.gvhd_symptoms}</p>
                </SectionCard>
              )}
              {treatment.conditions_treated && (
                <SectionCard title="Conditions Treated" icon={Heart}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{treatment.conditions_treated}</p>
                </SectionCard>
              )}
              {treatment.diagnosis_detail && (
                <SectionCard title="Diagnosis Details" icon={Activity}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{treatment.diagnosis_detail}</p>
                </SectionCard>
              )}
              {treatment.why_india_detail && (
                <SectionCard title="Why Choose India" icon={Heart}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{treatment.why_india_detail}</p>
                </SectionCard>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-white rounded-2xl p-5 sm:p-6 border lg:sticky lg:top-24">
                <h3 className="font-heading font-bold text-base sm:text-lg mb-3 sm:mb-4">Get a Free Quote</h3>
                <p className="text-sm text-muted-foreground mb-5 sm:mb-6">
                  Our medical experts will review your case and provide a detailed treatment plan.
                </p>
                {/* FIX: was a <Button> (renders its own <button>) wrapped inside a plain
                    <button> — invalid nested interactive elements. Now a single Button
                    with onClick directly on it. */}
                <Button
                  onClick={() =>
                    openLeadModal({
                      title: "Get a Free Quote",
                      description: `Get a free, no-obligation quote for ${treatment.name}.`,
                      treatmentInterest: treatment.name,
                    })
                  }
                  className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-white rounded-xl gap-2"
                >
                  <Calendar className="w-4 h-4" /> Request Quote
                </Button>
              </div>
            </div>
          </div>

          {/* Related doctors — specialists in this treatment's category */}
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

          {/* Related hospitals — hospitals offering this treatment's category */}
          {relatedHospitals.length > 0 && (
            <div className="mt-8 sm:mt-10">
              <h2 className="font-heading font-bold text-xl sm:text-2xl mb-5 sm:mb-6">Related Hospitals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedHospitals.map((h) => (
                  <Link
                    key={h.id}
                    to={`/hospitals/${h.id}`}
                    className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-32 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden shrink-0">
                      {h.cover_image_url ? (
                        <img
                          src={h.cover_image_url}
                          alt={h.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-primary/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-heading font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {h.name}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {h.city}, {h.country}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
                        {h.beds_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 shrink-0" />
                            {h.beds_count}
                          </span>
                        )}
                        {h.rating > 0 && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current shrink-0" />
                            {h.rating}
                          </span>
                        )}
                      </div>
                    </div>
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