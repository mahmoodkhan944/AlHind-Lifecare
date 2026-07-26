import React from "react";
import { motion } from "framer-motion";
import { FileText, Mail, Phone, Globe, MapPin, AlertTriangle, Info } from "lucide-react";
import { useSiteSettings, getTelLink } from "@/hooks/useSiteSettings";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=1600&q=80";

const SECTIONS = [
  {
    number: "01",
    title: "Acceptance of Terms",
    paragraphs: [
      "By using this website, you agree to follow these Terms & Conditions.",
      "If you do not agree, please do not use the platform.",
    ],
  },
  {
    number: "02",
    title: "Platform Role",
    paragraphs: [
      "Alhind Medical Care is a facilitation platform. We are not a hospital, clinic, or medical provider.",
      "We only connect users with independent healthcare professionals and institutions.",
    ],
  },
  {
    number: "03",
    title: "User Responsibility",
    intro: "You agree to:",
    bullets: [
      "Provide accurate and complete information",
      "Use the platform responsibly",
      "Not misuse or attempt to harm the platform",
    ],
  },
  {
    number: "04",
    title: "No Medical Advice",
    paragraphs: ["The platform does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional."],
  },
  {
    number: "05",
    title: "Independent Providers",
    paragraphs: ["All doctors, hospitals, and clinics listed are independent. They are solely responsible for their services and medical care."],
  },
  {
    number: "06",
    title: "No Guarantees",
    intro: "We do not guarantee:",
    bullets: [
      "Availability of doctors or services",
      "Treatment outcomes",
      "Accuracy of information",
    ],
  },
  {
    number: "07",
    title: "Appointments & Services",
    bullets: [
      "Appointment availability depends on the provider",
      "We do not guarantee confirmation or scheduling",
      "Delays or cancellations may occur",
    ],
  },
  {
    number: "08",
    title: "Payments & Costs",
    bullets: [
      "Any cost shown is approximate",
      "Final pricing is decided by the provider",
      "We are not responsible for billing disputes",
    ],
  },
  {
    number: "09",
    title: "Limitation of Liability",
    intro: "Alhind Medical Care is not responsible for:",
    bullets: [
      "Medical decisions or outcomes",
      "Complications or damages",
      "Delays, cancellations, or service issues",
    ],
  },
  {
    number: "10",
    title: "Website Use",
    intro: "You agree not to:",
    bullets: [
      "Use the site for unlawful purposes",
      "Attempt to hack, damage, or disrupt the platform",
    ],
  },
  {
    number: "11",
    title: "Intellectual Property",
    paragraphs: ["All content on this website belongs to Alhind Medical Care and may not be copied or reused without permission."],
  },
  {
    number: "12",
    title: "Privacy",
    paragraphs: ["Your use of the platform is also governed by our Privacy Policy."],
  },
  {
    number: "13",
    title: "Changes to Terms",
    bullets: [
      "We may update these Terms at any time.",
      "Continued use of the website means you accept the updated terms.",
    ],
  },
  {
    number: "14",
    title: "Termination",
    paragraphs: ["We reserve the right to restrict or terminate access if terms are violated."],
  },
  {
    number: "15",
    title: "Governing Law",
    paragraphs: ["These Terms shall be governed by the laws of India."],
  },
];

function SectionBadge({ number }) {
  return (
    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200">
      {number}
    </span>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2.5 mt-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm md:text-[15px] leading-relaxed">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
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

export default function Terms() {
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
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-emerald-900/85" />
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
            Terms &amp; Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-sm md:text-base"
          >
            Last Updated: July 15, 2026 · Alhind Medical Care
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-6 sm:py-8 -mt-6 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          {/* Intro card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 flex gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm md:text-[15px] text-emerald-800 leading-relaxed">
              Welcome to Alhind Medical Care. By accessing and using our website and services, you agree to be bound by these Terms &amp; Conditions. Please read them carefully before using our platform.
            </p>
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

          {/* Medical Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 flex gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-700 text-base md:text-lg mb-1">Important Medical Disclaimer</h3>
              <p className="text-sm md:text-[15px] text-amber-700/90 leading-relaxed">
                Alhind Medical Care is a medical tourism facilitator, not a healthcare provider. All medical services listed on our platform are provided by independent hospitals and doctors. We do not offer medical advice, diagnoses, or treatment guarantees. All medical decisions should be made in consultation with qualified healthcare professionals.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 py-10 sm:py-12 md:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">Contact &amp; Acknowledgement</h2>
            <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto">
              By using our services, you confirm you have read and agreed to these Terms &amp; Conditions. For any questions, reach us at:
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
            <p className="text-white/60 text-xs">© 2026 Alhind Medical Care. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}