import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  DollarSign,
  Clock,
  ShieldCheck,
  UserCheck,
  FileText,
  HeartHandshake,
  Star,
  MapPin,
  Bed,
  Building2,
  Loader2,
  ArrowRight,
  Headset,
  Plane,
  Hospital,
  BadgeCheck,
  TrendingUp,
  RefreshCw,
  Calendar,
  Activity,
  AlertTriangle,
  Heart,
  Eye,
  Stethoscope,
  Pill,
  Scissors,
  Target,
  Info,
} from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { useLeadModal } from "@/lib/LeadModalContext";
import { COUNTRIES, getDialCode } from "@/lib/countries";
import { validatePhone, friendlyError } from "@/lib/formValidation";
import { useSiteSettings, DEFAULT_SETTINGS, getWhatsAppLink } from "@/hooks/useSiteSettings";
import { slugify } from "@/lib/slugify";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import DetailPageSkeleton from "@/components/common/DetailPageSkeleton";

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

const parseObj = (val) => {
  if (!val) return {};
  if (typeof val === "object" && !Array.isArray(val)) return val;
  try { const p = JSON.parse(val); return p && typeof p === "object" && !Array.isArray(p) ? p : {}; } catch { return {}; }
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1758691461957-474a7686e388?w=1600&q=80";

// A treatment's `country` field is 'India' | 'Turkey' | 'Both' (or blank).
// This turns that into copy-friendly text used throughout the landing page,
// so the same page correctly promotes whichever country(s) the treatment is
// actually offered in — no need for separate per-country URLs.
const countryLabel = (country) => {
  if (country === "India") return "India";
  if (country === "Turkey") return "Turkey";
  return "India and Turkey";
};

const TRUST_BADGES = [
  { icon: Headset, label: "24/7 Support" },
  { icon: Plane, label: "Visa & Travel Help" },
  { icon: Hospital, label: "JCI & NABH Hospitals" },
  { icon: BadgeCheck, label: "Fully Guided Journey" },
];

const whyChoiceItems = (country) => [
  { icon: DollarSign, title: "Significantly Lower Cost", desc: `World-class treatment at a fraction of the cost compared to the US, UK, or Gulf — without compromising on quality of care.`, stat: "Fraction of Cost", statLabel: "vs. US, UK & Gulf pricing" },
  { icon: ShieldCheck, title: "JCI & NABH Accredited Hospitals", desc: "Every partner hospital holds international accreditation — the same standard held by leading hospitals worldwide.", stat: "100%", statLabel: "Accredited partner hospitals" },
  { icon: UserCheck, title: "Senior, Experienced Specialists", desc: "Your treatment is led by senior consultants with years of hands-on surgical experience.", stat: "Senior Only", statLabel: "No trainees, ever" },
  { icon: FileText, title: "Medical Visa — We Handle It", desc: `We prepare your hospital invitation letter and guide you through the entire ${country} medical visa process.`, stat: "Full Support", statLabel: "Visa handled end-to-end" },
  { icon: Clock, title: "Minimal Waiting Times", desc: "Skip long waitlists back home — get scheduled quickly with fast hospital availability.", stat: "Fast-Track", statLabel: "No referral needed" },
  { icon: HeartHandshake, title: "Dedicated Patient Coordinator", desc: "From airport pickup to discharge, your coordinator handles logistics, translation, and hospital communication.", stat: "24/7", statLabel: "Support availability" },
];

const PROCESS_STEPS = [
  { icon: FileText, title: "Share Your Reports", desc: "Send us your diagnosis, imaging, or medical records — WhatsApp or email, any format works." },
  { icon: Calendar, title: "Get Your Quote", desc: "Our team reviews your case and shares a detailed treatment plan with a cost estimate, usually within 48 hours." },
  { icon: Plane, title: "Visa & Travel", desc: "We prepare your medical visa invitation letter, book flights, and arrange airport transfers and accommodation." },
  { icon: HeartHandshake, title: "Arrive & Recover", desc: "Your coordinator receives you at the airport. You get world-class treatment and guided recovery before heading home." },
];

const visaSteps = (country) => [
  { icon: FileText, title: "We Prepare Your Hospital Letter", desc: `We arrange the official hospital invitation letter and documentation needed for your ${country} medical visa application.` },
  { icon: ShieldCheck, title: "We Handle Your Visa, End to End", desc: "We guide you through the medical visa application so you arrive with everything in order." },
  { icon: Plane, title: "We Help Book Your Flights", desc: "We advise on the best routes and fares to your treatment city for your travel dates." },
  { icon: MapPin, title: "We Receive You at the Airport", desc: "Our representative meets you on arrival and transfers you directly to your hospital or hotel." },
];

export default function TreatmentDetail({ forceLanding = false }) {
  const { slug } = useParams();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedDoctors, setRelatedDoctors] = useState([]);
  const [relatedHospitals, setRelatedHospitals] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const { openLeadModal } = useLeadModal();

  useEffect(() => {
    setLoading(true);
    // Try, in order: (1) an exact slug match — the normal case; (2) treat the
    // param as a raw id, for old /treatments/<uuid> links; (3) for older
    // records created before the slug column was populated, compute
    // slugify(name) for every treatment and match against that — so a
    // treatment whose `slug` field is blank in the database still resolves
    // correctly instead of showing "Treatment not found".
    db.entities.Treatment.filter({ slug })
      .then((matches) => {
        if (matches.length > 0) return matches[0];
        return db.entities.Treatment.get(slug).catch(() => null);
      })
      .then((found) => {
        if (found) return found;
        return db.entities.Treatment.list("-created_date", 2000).then(
          (all) => all.find((t) => slugify(t.slug || t.name) === slugify(slug)) || null
        );
      })
      .then(setTreatment)
      .catch(() => setTreatment(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!treatment) return;
    const doctorIds = parseList(treatment.doctor_ids);
    if (doctorIds.length > 0) {
      Promise.all(doctorIds.map((id) => db.entities.Doctor.get(id).catch(() => null)))
        .then((docs) => setRelatedDoctors(docs.filter((d) => d && d.status !== "inactive").slice(0, 4)))
        .catch(() => {});
    } else if (treatment.category) {
      db.entities.Doctor.filter({ status: "active", speciality: treatment.category }, "-rating", 4)
        .then(setRelatedDoctors)
        .catch(() => {});
    }
  }, [treatment]);

  useEffect(() => {
    if (!treatment) return;
    const hospitalIds = parseList(treatment.hospital_ids);
    if (hospitalIds.length > 0) {
      Promise.all(hospitalIds.map((id) => db.entities.Hospital.get(id).catch(() => null)))
        .then((hospitals) => setRelatedHospitals(hospitals.filter((h) => h && h.status !== "inactive").slice(0, 4)))
        .catch(() => {});
    } else if (treatment.category) {
      db.entities.Hospital.filter({ status: "active" }, "-rating", 200)
        .then((hospitals) => {
          const matches = hospitals.filter((h) => parseList(h.specialities).includes(treatment.category));
          setRelatedHospitals(matches.slice(0, 4));
        })
        .catch(() => {});
    }
  }, [treatment]);

  useEffect(() => {
    db.entities.FAQ.filter({ status: "active" }, "order", 6)
      .then(setFaqs)
      .catch(() => {});
  }, []);

  // Sets the browser tab title / SEO meta description only — nothing from
  // this renders anywhere on the visible page.
  useDocumentMeta({
    title: treatment
      ? treatment.meta_title || `${treatment.name} | AlHind Lifecare`
      : undefined,
    description: treatment
      ? treatment.meta_description || treatment.description || undefined
      : undefined,
  });

  if (loading) {
    return <DetailPageSkeleton />;
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

  const shared = { treatment, relatedDoctors, relatedHospitals, faqs, openLeadModal };

  // The landing (ad-style) design only ever shows on /landing/:slug — and
  // only if the admin has actually turned it on for this treatment. Every
  // other path, including "View Details" links from the site's own
  // Treatments listing, always uses the classic page.
  const showLanding = forceLanding && treatment.landing_page_enabled;

  return showLanding ? <LandingPage {...shared} /> : <ClassicPage {...shared} />;
}

// ============================================================================
// LANDING PAGE — full marketing funnel design, opt-in per treatment via
// Admin → Treatments → Edit → "Show as Landing Page".
// ============================================================================
function LandingPage({ treatment, relatedDoctors, relatedHospitals, faqs, openLeadModal }) {
  const { toast } = useToast();
  const { data: settings = DEFAULT_SETTINGS } = useSiteSettings();
  const [form, setForm] = useState({ patient_name: "", email: "", country: "Select Country", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  // If the treatment is offered in both countries, let the patient pick
  // which one they're interested in — this choice then drives every "India"
  // / "Turkey" mention on the page (heading, visa section, etc.) and gets
  // sent along with their lead so the team knows their preference.
  const offersBoth = treatment.country === "Both" || !treatment.country;
  const [selectedDestination, setSelectedDestination] = useState(
    offersBoth ? "India" : treatment.country
  );
  const country = offersBoth ? selectedDestination : countryLabel(treatment.country);
  const keyBenefits = parseList(treatment.key_benefits);

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_name || !form.phone) return;
    setSubmitting(true);
    const check = await validatePhone(form.phone, form.country);
    if (!check.valid) {
      toast({ title: check.error, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    try {
      await db.entities.Lead.create({
        patient_name: form.patient_name,
        email: form.email || "",
        phone: check.formatted,
        country: form.country,
        treatment_interest: offersBoth ? `${treatment.name} (${selectedDestination})` : treatment.name,
        message: `Preferred destination: ${country}${form.message ? `\n\n${form.message}` : ""}`,
        source: "treatment_landing_page",
        status: "new",
      });
      toast({ title: "Thank you! Our team will contact you shortly." });
      setForm({ patient_name: "", email: "", country: "Select Country", phone: "", message: "" });
    } catch (err) {
      toast({ title: friendlyError(err), variant: "destructive" });
    }
    setSubmitting(false);
  };

  const waLink = getWhatsAppLink(settings.whatsapp_number);

  return (
    <div>
      {/* HERO — headline, benefits, trust badges, CTA + inline lead form */}
      <section className="relative pt-20 sm:pt-24 pb-10 sm:pb-14 bg-gradient-to-br from-secondary via-secondary to-[#0E8C7A] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={treatment.image_url || HERO_IMAGE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="decor-blob decor-blob-primary w-96 h-96 -top-24 -right-24" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-wide mb-4">
                For International Patients Seeking {treatment.name} in {country}
              </span>
              <h1 className="font-heading font-extrabold text-[clamp(1.6rem,4.5vw,2.75rem)] leading-tight mb-2 text-balance">
                World-Class {treatment.name} Treatment in {country}
              </h1>
              <p className="text-accent-warm font-semibold text-base sm:text-lg mb-5">Affordable. Proven. Guided.</p>

              {keyBenefits.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {keyBenefits.slice(0, 5).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/90 text-sm sm:text-base">
                      <CheckCircle2 className="w-5 h-5 text-accent-warm shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/85 text-xs font-medium">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </span>
                ))}
              </div>

              {(settings.patients_assisted || settings.google_rating || settings.trusted_since_year) && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-7 text-sm text-white/80">
                  {settings.patients_assisted && (
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-warm" /> {settings.patients_assisted} Patients Assisted</span>
                  )}
                  {settings.google_rating && (
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-accent-warm fill-accent-warm" /> {settings.google_rating} Google Rating</span>
                  )}
                  {settings.trusted_since_year && (
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-warm" /> Trusted Since {settings.trusted_since_year}</span>
                  )}
                </div>
              )}

              {offersBoth && (
                <div className="mb-7">
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2">
                    Where would you like to be treated?
                  </p>
                  <div className="inline-flex rounded-full bg-white/10 border border-white/20 p-1">
                    {["India", "Turkey"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedDestination(c)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                          selectedDestination === c ? "bg-white text-secondary" : "text-white/80 hover:text-white"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" /> {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#quote-form"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-heading font-bold text-sm shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5"
                >
                  Get Free Treatment Plan <ArrowRight className="w-4 h-4" />
                </a>
                {settings.whatsapp_number && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/25 hover:bg-white/20 text-white font-heading font-semibold text-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                  </a>
                )}
              </div>
            </motion.div>

            <motion.div
              id="quote-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 scroll-mt-24"
            >
              <h2 className="font-heading font-bold text-lg sm:text-xl text-secondary mb-1">Get Free Consultation</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Share a few details — our medical team will get back to you shortly.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Full Name *"
                  value={form.patient_name}
                  onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                />
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.name}>
                        <span className="mr-2">{c.flag}</span> {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-2.5 h-10 rounded-lg border border-input bg-muted/50 text-xs font-semibold whitespace-nowrap min-w-[56px] shrink-0">
                    {getDialCode(form.country)}
                  </div>
                  <Input
                    type="tel"
                    placeholder="WhatsApp Number *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="flex-1 min-w-0 h-10 rounded-lg text-sm"
                    required
                  />
                </div>
                <Textarea
                  placeholder="Anything specific about your condition you'd like us to know? (Optional)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="rounded-lg text-sm min-h-[64px] resize-none"
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-primary text-white hover:bg-primary/90 font-heading font-bold text-sm transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Get Free Treatment Plan <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Treatment overview */}
      <section className="pt-6 sm:pt-8 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative bg-gradient-to-br from-secondary via-secondary to-[#0E8C7A] rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden">
            <div className="decor-blob decor-blob-primary w-72 h-72 -top-20 -right-10" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="min-w-0">
                {treatment.featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold mb-3">
                    <Star className="w-3 h-3 fill-current" /> Most Requested
                  </span>
                )}
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl text-white mb-2 text-balance">
                  {treatment.name} in {country}
                </h2>
                {(treatment.description || treatment.detailed_content) && (
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl line-clamp-3">
                    {treatment.description || treatment.detailed_content}
                  </p>
                )}
              </div>
              <Button
                onClick={() =>
                  openLeadModal({
                    title: "Get a Free Quote",
                    description: `Get a free, no-obligation quote for ${treatment.name} in ${country}.`,
                    treatmentInterest: offersBoth ? `${treatment.name} (${selectedDestination})` : treatment.name,
                  })
                }
                className="bg-white text-secondary hover:bg-white/90 rounded-2xl h-12 px-8 font-heading font-bold shrink-0 shadow-lg"
              >
                Get a Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose this country */}
      <section className="py-8 sm:py-10 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-3">
              Why Us
            </span>
            <h2 className="font-heading font-bold text-[clamp(1.3rem,4.5vw,1.75rem)] whitespace-normal sm:whitespace-nowrap sm:text-[clamp(0.85rem,3.2vw,1.75rem)] mb-2">
              Why international patients choose {country} for healthcare
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              World-class hospitals, international accreditation, and costs a fraction of Western alternatives —
              without compromising on quality of care.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyChoiceItems(country).map(({ icon: Icon, title, desc, stat, statLabel }, i) => {
              const palette = [
                { bg: "bg-amber-100", text: "text-amber-600", stat: "text-amber-600" },
                { bg: "bg-rose-100", text: "text-rose-600", stat: "text-rose-600" },
                { bg: "bg-orange-100", text: "text-orange-600", stat: "text-orange-600" },
                { bg: "bg-blue-100", text: "text-blue-600", stat: "text-violet-600" },
                { bg: "bg-red-100", text: "text-red-600", stat: "text-accent-jade" },
                { bg: "bg-emerald-100", text: "text-emerald-600", stat: "text-red-600" },
              ][i % 6];
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm ring-1 ring-black/5 flex flex-col"
                >
                  <span className={`flex items-center justify-center w-11 h-11 rounded-xl ${palette.bg} ${palette.text} mb-4 shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="font-heading font-bold text-base mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  {stat && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className={`font-heading font-extrabold text-lg ${palette.stat}`}>{stat}</p>
                      <p className="text-xs text-muted-foreground">{statLabel}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-3">
              How It Works
            </span>
            <h2 className="font-heading font-bold text-[clamp(1.3rem,4.5vw,1.75rem)] whitespace-normal sm:whitespace-nowrap sm:text-[clamp(0.85rem,3.2vw,1.75rem)]">
              From your country to {country} — in 4 simple steps
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS_STEPS.map((step, i) => {
              const palette = ["bg-emerald-500", "bg-amber-500", "bg-teal-600", "bg-emerald-500"][i % 4];
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`flex items-center justify-center w-11 h-11 rounded-xl ${palette} text-white shrink-0`}>
                      <step.icon className="w-5 h-5" />
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="font-heading font-extrabold text-xl text-muted-foreground/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm sm:text-base mb-1.5">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visa & travel */}
      <section className="py-8 sm:py-10 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-3">
              Visa &amp; Travel
            </span>
            <h2 className="font-heading font-bold text-[clamp(1.3rem,4.5vw,1.75rem)] whitespace-normal sm:whitespace-nowrap sm:text-[clamp(0.85rem,3.2vw,1.75rem)] mb-2">
              The {country} medical visa process, simplified
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              We guide every patient through the entire process — from the hospital letter to landing in {country}.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visaSteps(country).map((step, i) => {
              const palette = ["bg-teal-600", "bg-rose-500", "bg-amber-500", "bg-emerald-500"][i % 4];
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`flex items-center justify-center w-11 h-11 rounded-xl ${palette} text-white shrink-0`}>
                      <step.icon className="w-5 h-5" />
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="font-heading font-extrabold text-xl text-muted-foreground/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm sm:text-base mb-1.5">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <RelatedSections relatedDoctors={relatedDoctors} relatedHospitals={relatedHospitals} shaded />

      {faqs.length > 0 && (
        <section className="py-8 sm:py-10 bg-muted">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-3">
                Common Questions
              </span>
              <h2 className="font-heading font-bold text-[clamp(1.3rem,4.5vw,1.75rem)] whitespace-normal sm:whitespace-nowrap sm:text-[clamp(0.85rem,3.2vw,1.75rem)]">
                Frequently asked questions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {faqs.map((faq, i) => (
                <div key={faq.id || i} className="rounded-xl border border-primary/20 bg-white overflow-hidden hover:border-primary/40 transition-colors">
                  <Accordion type="single" collapsible>
                    <AccordionItem value={`faq-${i}`} className="border-0">
                      <AccordionTrigger className="font-heading font-semibold text-left text-sm md:text-base py-4 px-5 hover:no-underline hover:text-primary text-foreground">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed px-5 pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 sm:py-14 bg-gradient-to-br from-secondary via-secondary to-[#0E8C7A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-wide mb-4">
            For a Better Life
          </span>
          <h2 className="font-heading font-bold text-[clamp(1.3rem,4.5vw,1.75rem)] whitespace-normal sm:whitespace-nowrap sm:text-[clamp(0.85rem,3.2vw,1.75rem)] text-white mb-3">
            Get your personalised treatment plan
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-7">
            Share your reports or describe your symptoms. Our team reviews your case and sends a treatment plan
            and cost estimate — with no obligation and no pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#quote-form"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-heading font-bold text-sm shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5"
            >
              Get My Free Treatment Plan <ArrowRight className="w-4 h-4" />
            </a>
            {settings.whatsapp_number && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/25 hover:bg-white/20 text-white font-heading font-semibold text-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Us Now
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// CLASSIC PAGE — the original, simpler detail page. Used by default for
// every treatment unless "Show as Landing Page" is turned on.
// ============================================================================
function ClassicPage({ treatment, relatedDoctors, relatedHospitals, openLeadModal }) {
  const { data: settings = DEFAULT_SETTINGS } = useSiteSettings();

  // The fixed CTA panel should only appear once the two-column content
  // section (marked by this ref) has scrolled up to roughly navbar height —
  // otherwise it floats over the hero image before the user scrolls at all.
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

  const infoCards = [
    { icon: DollarSign, label: "Cost Range", value: treatment.cost_range_usd },
    { icon: Clock, label: "Duration", value: treatment.duration },
    { icon: TrendingUp, label: "Success Rate", value: treatment.success_rate },
    { icon: RefreshCw, label: "Recovery Time", value: treatment.recovery_time },
  ].filter((c) => c.value);

  const waLink = getWhatsAppLink(settings.whatsapp_number);

  return (
    <div className="pb-20 lg:pb-0">
      <section className="pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            to="/treatments"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 sm:mb-5 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Treatments
          </Link>

          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[26rem] sm:h-[28rem]">
              <img
                src={treatment.image_url || HERO_IMAGE}
                alt={treatment.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />

              {treatment.category && (
                <span className="absolute top-4 sm:top-5 left-4 sm:left-5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs sm:text-sm font-semibold text-foreground shadow-sm">
                  {treatment.category}
                </span>
              )}
              {treatment.success_rate && (
                <span className="absolute top-4 sm:top-5 right-4 sm:right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-jade text-white text-xs sm:text-sm font-bold shadow-sm">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {treatment.success_rate} success
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                <h1 className="font-heading font-extrabold text-[clamp(1.4rem,4.5vw,2.5rem)] mb-2 text-balance">
                  {treatment.name}
                </h1>
                {treatment.description && (
                  <p className="text-white/85 text-sm sm:text-base max-w-2xl mb-4 text-balance">
                    {treatment.description}
                  </p>
                )}
                {infoCards.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t border-white/20">
                    {infoCards.slice(0, 3).map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 text-accent-warm" />
                        <div>
                          <p className="text-[11px] sm:text-xs text-white/70">{label}</p>
                          <p className="font-heading font-bold text-sm sm:text-base">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={contentTopRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              {treatment.detailed_content && (
                <div className="bg-secondary/5 rounded-xl p-5 sm:p-6 md:p-7 border-l-4 border-secondary">
                  <h2 className="font-heading font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">
                    {treatment.name}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4">
                    {treatment.detailed_content}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {treatment.category && (
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs font-bold text-secondary mb-1">Category</p>
                        <p className="text-sm text-muted-foreground">{treatment.category}</p>
                      </div>
                    )}
                    {treatment.country && (
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs font-bold text-secondary mb-1">Available In</p>
                        <p className="text-sm text-muted-foreground">{countryLabel(treatment.country)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {resolveSectionConfig(treatment.section_config, DEFAULT_TREATMENT_SECTIONS)
                .filter((s) => s.visible !== false)
                .map((s) => renderTreatmentSection(s.key, s.title, treatment))}
              {/* "Why India" / "Why Turkey" (the free-text fields) are intentionally
                  not rendered here — kept as backend-only fields the admin can fill
                  in for internal reference, without showing on the public page. */}
            </div>

            {/* Empty spacer — just reserves the 1/3 column width so the left
                content stays at 2/3 width on large screens. The actual
                visible buttons are the fixed panel below, rendered outside
                the grid so they're never subject to any sticky/overflow
                quirks — this is the same fixed-positioning approach already
                used for the Navbar and the Call/WhatsApp buttons on this
                site, chosen because plain CSS `sticky` was unreliable here. */}
            <div className="hidden lg:block" />
          </div>

          <RelatedSections relatedDoctors={relatedDoctors} relatedHospitals={relatedHospitals} />
        </div>
      </section>

      {/* Mobile-only persistent bottom CTA bar — stays fixed at the bottom of
          the screen the whole time on mobile/tablet, so the primary action
          is always one tap away no matter how far the person has scrolled. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-3 py-2.5 flex gap-2">
        <Button
          onClick={() =>
            openLeadModal({
              title: "Get a Free Quote",
              description: `Get a free, no-obligation quote for ${treatment.name}.`,
              treatmentInterest: treatment.name,
            })
          }
          className="flex-1 h-11 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-sm font-heading font-bold"
        >
          Get Quotation
        </Button>
        {settings.whatsapp_number && (
          <Button variant="outline" asChild className="h-11 w-11 shrink-0 rounded-xl p-0">
            <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <MessageCircle className="w-5 h-5" />
            </a>
          </Button>
        )}
      </div>

      {/* Desktop-only fixed panel — stays hidden until the content section
          (tracked via contentTopRef) has scrolled up near the navbar, so it
          never floats over the hero image; then it's always visible while
          scrolling, aligned to where the sidebar column above appears, using
          the same max-w-7xl container math. */}
      <div
        className={`hidden lg:block fixed top-24 inset-x-0 z-30 pointer-events-none transition-opacity duration-300 ${
          showFloatingCta ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-end">
            <div className={`w-full lg:w-[calc(33.333%-1rem)] flex flex-col gap-2 ${showFloatingCta ? "pointer-events-auto" : "pointer-events-none"}`}>
              <Button
                onClick={() =>
                  openLeadModal({
                    title: "Get a Free Quote",
                    description: `Get a free, no-obligation quote for ${treatment.name}.`,
                    treatmentInterest: treatment.name,
                  })
                }
                className="h-12 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-base font-heading font-bold shadow-lg"
              >
                Get Quotation
              </Button>
              {settings.whatsapp_number && (
                <Button variant="outline" asChild className="h-12 rounded-xl gap-2 text-base font-heading font-semibold bg-white shadow-lg">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// These fields (Conditions Treated, Diagnosis Details, Why Choose
// India/Turkey, etc.) are stored as a single text block, with each item
// typically entered on its own line in the admin form. Rendered as a plain
// <p>, those line breaks collapse and everything runs together in one
// paragraph — this renders each line as its own bulleted item instead,
// falling back to a plain paragraph if there's genuinely just one line.
function TextAsList({ text, theme }) {
  const lines = String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>;
  }

  const ItemIcon = theme?.icon || CheckCircle2;

  return (
    <ul className="space-y-2">
      {lines.map((line, idx) => (
        <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <span className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${theme ? `${theme.bg} ${theme.color}` : "bg-secondary/15 text-secondary"}`}>
            <ItemIcon className="w-3.5 h-3.5" />
          </span>
          <span className="pt-0.5">{line}</span>
        </li>
      ))}
    </ul>
  );
}

// The built-in order and titles for every section on a treatment's
// classic detail page. Admins can override order/title/visibility per
// treatment via the "Section Order & Titles" editor in the admin form
// (stored in treatment.section_config) — this is just the fallback.
export const DEFAULT_TREATMENT_SECTIONS = [
  { key: "key_benefits", title: "Key Benefits" },
  { key: "overview", title: "Overview" },
  { key: "signs_symptoms", title: "Signs & Symptoms" },
  { key: "related_conditions", title: "Conditions Treated" },
  { key: "diagnosis", title: "Diagnosis & Evaluation" },
  { key: "treatment_types", title: "Types of Treatment" },
  { key: "surgery_types", title: "Types of Surgery" },
  { key: "purpose", title: "Purpose" },
  { key: "recovery_details", title: "Recovery" },
  { key: "risks", title: "Risks & Complications" },
  { key: "summary", title: "Summary" },
  { key: "why_choose_india", title: "Why Choose India?" },
  { key: "why_choose_turkey", title: "Why Choose Turkey?" },
  { key: "how_its_done", title: "How It Is Done" },
  { key: "treatment_procedures", title: "Treatment Procedures" },
  { key: "additional_information", title: "Additional Information" },
  { key: "gvhd_info", title: "GVHD Information" },
  { key: "gvhd_symptoms", title: "GVHD Symptoms" },
  { key: "conditions_treated", title: "Conditions Treated" },
  { key: "diagnosis_detail", title: "Diagnosis Details" },
];

// Merges the admin's saved section_config with the built-in defaults — any
// section key the admin's saved config doesn't know about yet (e.g. one
// added after they last saved) is appended at the end, visible by default,
// so new sections never silently disappear for existing records.
export function resolveSectionConfig(raw, defaults) {
  const saved = parseList(raw);
  if (saved.length === 0) return defaults.map((s) => ({ ...s, visible: true }));
  const known = new Set(saved.map((s) => s.key));
  const missing = defaults.filter((s) => !known.has(s.key)).map((s) => ({ ...s, visible: true }));
  return [...saved, ...missing];
}

const CHECKLIST_KEYS = [
  "overview", "signs_symptoms", "related_conditions", "diagnosis", "treatment_types",
  "surgery_types", "purpose", "recovery_details", "risks", "summary",
  "why_choose_india", "why_choose_turkey",
];
const NUMBERED_KEYS = ["how_its_done", "treatment_procedures"];
const TEXT_BLOCK_KEYS = ["gvhd_info", "gvhd_symptoms", "conditions_treated", "diagnosis_detail"];

// A themed icon + color for every checklist/text-block section except
// "How It's Done" (numbered, not a checklist) — falls back to a plain
// checkmark for anything not listed here.
const SECTION_ICON_THEME = {
  key_benefits: { icon: Star, bg: "bg-amber-100", color: "text-amber-500" },
  overview: { icon: Eye, bg: "bg-blue-100", color: "text-blue-500" },
  signs_symptoms: { icon: Activity, bg: "bg-rose-100", color: "text-rose-500" },
  related_conditions: { icon: Heart, bg: "bg-pink-100", color: "text-pink-500" },
  diagnosis: { icon: Stethoscope, bg: "bg-teal-100", color: "text-teal-600" },
  treatment_types: { icon: Pill, bg: "bg-indigo-100", color: "text-indigo-500" },
  surgery_types: { icon: Scissors, bg: "bg-purple-100", color: "text-purple-500" },
  purpose: { icon: Target, bg: "bg-orange-100", color: "text-orange-500" },
  recovery_details: { icon: RefreshCw, bg: "bg-emerald-100", color: "text-emerald-600" },
  risks: { icon: AlertTriangle, bg: "bg-red-100", color: "text-red-500" },
  summary: { icon: FileText, bg: "bg-slate-100", color: "text-slate-600" },
  why_choose_india: { icon: MapPin, bg: "bg-green-100", color: "text-green-600" },
  why_choose_turkey: { icon: MapPin, bg: "bg-cyan-100", color: "text-cyan-600" },
  additional_information: { icon: Info, bg: "bg-sky-100", color: "text-sky-500" },
  gvhd_info: { icon: FileText, bg: "bg-violet-100", color: "text-violet-500" },
  gvhd_symptoms: { icon: Activity, bg: "bg-rose-100", color: "text-rose-500" },
  conditions_treated: { icon: Heart, bg: "bg-pink-100", color: "text-pink-500" },
  diagnosis_detail: { icon: Stethoscope, bg: "bg-teal-100", color: "text-teal-600" },
};

// Renders one section's content for the given key, or null if there's
// nothing to show (no content, or a why-choose-X section that doesn't
// apply to this treatment's country) — the caller filters out the nulls.
function renderTreatmentSection(key, title, treatment) {
  if (key === "why_choose_india" && treatment.country === "Turkey") return null;
  if (key === "why_choose_turkey" && treatment.country === "India") return null;

  if (key === "key_benefits" || CHECKLIST_KEYS.includes(key) || key === "additional_information") {
    const items = parseList(treatment[key]);
    if (items.length === 0) return null;
    const theme = SECTION_ICON_THEME[key];
    const ItemIcon = theme?.icon || CheckCircle2;
    return (
      <SectionCard key={key} title={title} subheading={parseObj(treatment.section_subheadings)[key]}>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${theme ? `${theme.bg} ${theme.color}` : "bg-secondary/15 text-secondary"}`}>
                <ItemIcon className="w-3.5 h-3.5" />
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    );
  }

  if (NUMBERED_KEYS.includes(key)) {
    const items = parseList(treatment[key]);
    if (items.length === 0) return null;
    return (
      <SectionCard key={key} title={title} subheading={parseObj(treatment.section_subheadings)[key]}>
        <ol className="space-y-3">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-jade text-white text-xs font-bold flex-shrink-0">
                {idx + 1}
              </span>
              <p className="text-sm text-muted-foreground pt-0.5">{item}</p>
            </li>
          ))}
        </ol>
      </SectionCard>
    );
  }

  if (TEXT_BLOCK_KEYS.includes(key)) {
    const text = treatment[key];
    if (!text) return null;
    return (
      <SectionCard key={key} title={title} subheading={parseObj(treatment.section_subheadings)[key]}>
        <TextAsList text={text} theme={SECTION_ICON_THEME[key]} />
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

// Shared "Related Doctors" / "Related Hospitals" grids, used by both designs.
function RelatedSections({ relatedDoctors, relatedHospitals, shaded = false }) {
  if (relatedDoctors.length === 0 && relatedHospitals.length === 0) return null;
  return (
    <>
      {relatedDoctors.length > 0 && (
        <div className={shaded ? "py-8 sm:py-10 bg-muted" : "mt-8 sm:mt-10"}>
          <div className={shaded ? "max-w-7xl mx-auto px-4 sm:px-6" : ""}>
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
        </div>
      )}

      {relatedHospitals.length > 0 && (
        <div className={shaded ? "" : "mt-8 sm:mt-10"}>
          <div className={shaded ? "max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10" : ""}>
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
                        <span className="flex items-center gap-1 text-[hsl(var(--accent-warm))]">
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
        </div>
      )}
    </>
  );
}