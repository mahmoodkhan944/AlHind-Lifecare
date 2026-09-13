import React, { useState, useEffect } from "react";
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
import { useSiteSettings, DEFAULT_SETTINGS, getWhatsAppLink } from "@/hooks/useSiteSettings";
import { slugify } from "@/lib/slugify";

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
    if (!treatment?.category) return;
    db.entities.Doctor.filter({ status: "active", speciality: treatment.category }, "-rating", 4)
      .then(setRelatedDoctors)
      .catch(() => {});
  }, [treatment?.category]);

  useEffect(() => {
    if (!treatment?.category) return;
    db.entities.Hospital.filter({ status: "active" }, "-rating", 200)
      .then((hospitals) => {
        const matches = hospitals.filter((h) => parseList(h.specialities).includes(treatment.category));
        setRelatedHospitals(matches.slice(0, 4));
      })
      .catch(() => {});
  }, [treatment?.category]);

  useEffect(() => {
    db.entities.FAQ.filter({ status: "active" }, "order", 6)
      .then(setFaqs)
      .catch(() => {});
  }, []);

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
    try {
      await db.entities.Lead.create({
        patient_name: form.patient_name,
        email: form.email || "",
        phone: `${getDialCode(form.country)} ${form.phone}`,
        country: form.country,
        treatment_interest: offersBoth ? `${treatment.name} (${selectedDestination})` : treatment.name,
        message: `Preferred destination: ${country}${form.message ? `\n\n${form.message}` : ""}`,
        source: "treatment_landing_page",
        status: "new",
      });
      toast({ title: "Thank you! Our team will contact you shortly." });
      setForm({ patient_name: "", email: "", country: "Select Country", phone: "", message: "" });
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
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
            <h2 className="font-heading font-bold text-[clamp(0.85rem,3.2vw,1.75rem)] whitespace-nowrap mb-2">
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
            <h2 className="font-heading font-bold text-[clamp(0.85rem,3.2vw,1.75rem)] whitespace-nowrap">
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
            <h2 className="font-heading font-bold text-[clamp(0.85rem,3.2vw,1.75rem)] whitespace-nowrap mb-2">
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
              <h2 className="font-heading font-bold text-[clamp(0.85rem,3.2vw,1.75rem)] whitespace-nowrap">
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
          <h2 className="font-heading font-bold text-[clamp(0.85rem,3.2vw,1.75rem)] whitespace-nowrap text-white mb-3">
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
    ...(treatment.country !== "Turkey" ? [{ key: "why_choose_india", title: "Why Choose India", icon: Heart }] : []),
    ...(treatment.country !== "India" ? [{ key: "why_choose_turkey", title: "Why Choose Turkey", icon: Heart }] : []),
  ];
  const listSections = sections
    .map((s) => ({ ...s, items: parseList(treatment[s.key]) }))
    .filter((s) => s.items.length > 0);

  const keyBenefits = parseList(treatment.key_benefits);
  const procedures = parseList(treatment.treatment_procedures);
  const additionalInfo = parseList(treatment.additional_information);

  return (
    <div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
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
              {treatment.why_turkey_detail && (
                <SectionCard title="Why Choose Turkey" icon={Heart}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{treatment.why_turkey_detail}</p>
                </SectionCard>
              )}
            </div>

            <div>
              <div className="bg-white rounded-2xl p-5 sm:p-6 border lg:sticky lg:top-24">
                <h3 className="font-heading font-bold text-base sm:text-lg mb-3 sm:mb-4">Get a Free Quote</h3>
                <p className="text-sm text-muted-foreground mb-5 sm:mb-6">
                  Our medical experts will review your case and provide a detailed treatment plan.
                </p>
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

          <RelatedSections relatedDoctors={relatedDoctors} relatedHospitals={relatedHospitals} />
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