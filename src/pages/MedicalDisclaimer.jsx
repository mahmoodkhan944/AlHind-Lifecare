import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Phone, Globe, MapPin, AlertTriangle } from "lucide-react";
import { useSiteSettings, getTelLink } from "@/hooks/useSiteSettings";
import { BRAND_NAME, MEDICAL_DISCLAIMER_TEXT } from "@/lib/patientJourney";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=1600&q=80";

const SECTIONS = [
  {
    number: "01",
    title: "Our Role",
    paragraphs: [
      `${BRAND_NAME} acts as a medical tourism and patient coordination facilitator. We are not a hospital, clinic or medical provider.`,
      "We help international patients connect with independent hospitals and doctors, and coordinate reports, consultations, travel and stay.",
    ],
  },
  {
    number: "02",
    title: "No Medical Advice",
    paragraphs: [
      "Information on this website — including doctor profiles, treatment pages, packages, blogs and FAQs — is for general information only.",
      "It is not medical advice, diagnosis or treatment, and must not replace a consultation with a qualified healthcare professional.",
    ],
  },
  {
    number: "03",
    title: "Clinical Decisions",
    paragraphs: [
      "All medical evaluations, donor suitability assessments, treatment recommendations, transplant approvals and clinical decisions are made solely by the treating hospital and its qualified medical team.",
      `${BRAND_NAME} does not independently provide medical diagnosis, treatment or medical approvals.`,
    ],
  },
  {
    number: "04",
    title: "Doctor & Hospital Information",
    bullets: [
      "Doctor and hospital details are based on information provided by the hospitals or publicly available sources.",
      "Qualifications, experience, availability and affiliations may change without notice.",
      "Patients should confirm all details directly with the hospital before making decisions.",
    ],
  },
  {
    number: "05",
    title: "Treatment Outcomes",
    bullets: [
      "Every patient is different, and results vary from person to person.",
      "No treatment outcome, recovery time or success is guaranteed.",
      "Success rates and statistics shown on this website are indicative only and are not a promise of individual results.",
    ],
  },
  {
    number: "06",
    title: "Costs & Estimates",
    bullets: [
      "Package prices and cost estimates are approximate.",
      "The final treatment plan and cost are decided by the hospital after medical assessment.",
      "Additional tests, longer stays or complications may change the final cost.",
    ],
  },
  {
    number: "07",
    title: "Medical Visa",
    paragraphs: [
      `${BRAND_NAME} helps coordinate hospital invitation letters where approved. The final visa decision rests with the relevant embassy or authorities.`,
    ],
  },
  {
    number: "08",
    title: "Independent Providers",
    paragraphs: [
      "All doctors and hospitals listed are independent. They are solely responsible for the medical care they provide, its quality and its outcomes.",
    ],
  },
];

function SectionBadge({ number }) {
  return (
    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-accent-jade/10 text-accent-jade text-sm font-bold border border-accent-jade/20">
      {number}
    </span>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2.5 mt-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm md:text-[15px] leading-relaxed">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-accent-jade flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionCard({ section }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-3">
        <SectionBadge number={section.number} />
        <h2 className="font-heading font-bold text-lg md:text-xl text-slate-900">{section.title}</h2>
      </div>
      {section.paragraphs?.map((p, i) => (
        <p key={i} className="text-sm md:text-[15px] text-slate-600 leading-relaxed mb-3">{p}</p>
      ))}
      {section.intro && <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed">{section.intro}</p>}
      {section.bullets && <BulletList items={section.bullets} />}
    </motion.div>
  );
}

export default function MedicalDisclaimer() {
  const { data: s } = useSiteSettings();

  const contactCards = [
    { icon: Mail, label: "Email", value: s?.email || "support@alhindmedical.com", href: `mailto:${s?.email || "support@alhindmedical.com"}` },
    { icon: Phone, label: "Phone", value: s?.phone || "+91 987 654 3210", href: getTelLink(s?.phone) },
    { icon: Globe, label: "Website", value: "alhindmedical.com", href: "https://alhindmedical.com" },
    { icon: MapPin, label: "Location", value: s?.address || "India", href: null },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-[#0E8C7A]/85" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              Legal Document
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-heading font-bold text-3xl md:text-5xl text-white mb-3"
          >
            Medical Disclaimer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-sm md:text-base"
          >
            Last Updated: November 17, 2026 · {BRAND_NAME}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-5 sm:py-6 -mt-6 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          {/* Intro card — the same text shown on doctor and treatment pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 flex gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm md:text-[15px] text-amber-800 leading-relaxed">{MEDICAL_DISCLAIMER_TEXT}</p>
          </motion.div>

          {SECTIONS.map((section) => (
            <SectionCard key={section.number} section={section} />
          ))}

          {/* Emergency Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-5 sm:p-6 flex gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-700 text-base md:text-lg mb-1">Emergency Notice</h3>
              <p className="text-sm md:text-[15px] text-red-600/90 leading-relaxed">
                This platform is not meant for emergencies. In case of a medical emergency, immediately call local emergency services (dial <strong>108</strong> or <strong>102</strong> in India) or visit the nearest hospital.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent-jade via-[#0B6F60] to-secondary py-7 sm:py-8 md:py-8">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">Contact &amp; Acknowledgement</h2>
            <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto">
              By using our services, you confirm you have read and understood this Medical Disclaimer. For any questions, reach us at:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {contactCards.map(({ icon: Icon, label, value, href }, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/70 text-xs">{label}</p>
                  {href ? (
                    <a href={href} className="text-white font-semibold text-sm truncate block hover:underline">{value}</a>
                  ) : (
                    <p className="text-white font-semibold text-sm truncate">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/20 text-center">
            <p className="text-white/60 text-xs">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}