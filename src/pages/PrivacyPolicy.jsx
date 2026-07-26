import React from "react";
import { motion } from "framer-motion";
import { Info, Mail, Phone, Globe, MapPin } from "lucide-react";
import { useSiteSettings, getTelLink } from "@/hooks/useSiteSettings";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=1600&q=80";

const SECTIONS = [
  {
    number: "01",
    title: "Introduction",
    paragraphs: [
      "Welcome to Alhind Medical Care. Alhind Medical Care is a medical tourism facilitation company registered in India. We work as a connecting platform that helps patients — both from India and other countries — get in touch with licensed hospitals, clinics, and medical professionals. We do not provide medical services, diagnosis, or treatment ourselves.",
      "This Privacy Policy explains how we collect, use, store, share, and protect the information you provide while using our website and services. By using our website, you agree to the practices described in this policy.",
    ],
    callout: "Alhind Medical Care acts only as a facilitator, not a healthcare provider. Any personal or medical information you share with us is used only to help connect you with third-party doctors, hospitals, or healthcare institutions.",
  },
  {
    number: "02",
    title: "Information We Collect",
    subsections: [
      {
        title: "2.1 Personal Identification Data",
        intro: "When you use our platform, we may collect:",
        bullets: [
          "Your full name and date of birth",
          "Your nationality and country of residence",
          "Your email address and phone number",
          "Passport or government ID details (if needed for international coordination)",
          "Your communication or messages with our team",
        ],
      },
      {
        title: "2.2 Medical Information (User-Submitted)",
        intro: "To help us connect you with the right doctor or hospital, you may choose to share:",
        bullets: [
          "Medical reports, prescriptions, or diagnoses",
          "Details about your current condition or symptoms",
          "Previous treatment history",
          "Any other health-related information you voluntarily provide",
        ],
        callout: "This information is shared only with the healthcare providers you are being connected with, and only with your knowledge and consent.",
      },
    ],
  },
  {
    number: "03",
    title: "Purpose of Data Collection",
    intro: "We collect and use your information to:",
    bullets: [
      "Understand your medical needs and connect you with suitable healthcare providers",
      "Schedule appointments and communicate with hospitals or doctors on your behalf",
      "Help with travel and arrangements if requested",
      "Send updates, confirmations, and service-related messages",
      "Improve our website and services",
      "Meet legal requirements under Indian law",
      "Respond to your questions and provide support",
    ],
    callout: "We do not use your data for unrelated commercial purposes, and we will not send you marketing messages without your clear consent.",
  },
  {
    number: "04",
    title: "Data Sharing and Disclosure",
    subsections: [
      {
        title: "4.1 Healthcare Providers",
        paragraphs: ["With your knowledge, we share necessary personal and medical details with hospitals, clinics, and doctors only to help coordinate your treatment."],
      },
      {
        title: "4.2 Third-Party Service Partners",
        paragraphs: ["We may work with trusted third parties such as travel agents, accommodation providers, and technical service providers. They are required to keep your information confidential and use it only for the intended purpose."],
      },
      {
        title: "4.3 Legal and Regulatory Disclosure",
        bullets: [
          "We may share your information if required by law, court orders, or government authorities, or to protect the rights and safety of Alhind Medical Care or others.",
          "We do not sell, rent, or trade your personal information to anyone for marketing or commercial purposes.",
        ],
      },
    ],
  },
  {
    number: "05",
    title: "International Data Transfers",
    paragraphs: ["Since we connect patients with healthcare providers around the world, your data may be transferred to or processed in other countries. These countries may have different data protection laws than your own."],
    bullets: [
      "In such cases, we take reasonable steps to ensure your data is handled safely and in line with applicable laws, including GDPR (where applicable) and Indian data protection laws.",
      "By using our services, you agree to such transfers when needed for your treatment coordination.",
    ],
  },
  {
    number: "06",
    title: "Data Protection and Security Measures",
    intro: "We take reasonable steps to protect your personal and medical data, including:",
    bullets: [
      "Using encryption (SSL/TLS) during data transfer",
      "Limiting access to authorized staff members only",
      "Regularly reviewing our data handling practices",
      "Storing data on secure, access-controlled servers",
    ],
  },
  {
    number: "07",
    title: "Your Rights as a Data Subject",
    intro: "Depending on applicable laws, you have the right to:",
    bullets: [
      "Access the data we hold about you",
      "Correct any incorrect or incomplete information",
      "Request deletion of your data (where legally allowed)",
      "Withdraw your consent at any time",
      "Object to certain types of data use",
      "Request your data in a structured format",
    ],
    callout: "To use any of these rights, please contact us using the details below.",
  },
  {
    number: "08",
    title: "Cookies and Tracking Technologies",
    intro: "We use cookies to improve your experience and understand how our website is used. These include:",
    bullets: [
      "Essential cookies (for basic functionality)",
      "Analytics cookies (to understand website usage)",
      "Preference cookies (to remember your settings)",
    ],
    callout: "You can control or disable cookies through your browser settings, but some features may not work properly if you do.",
  },
  {
    number: "09",
    title: "Third-Party Links and External Websites",
    paragraphs: [
      "Our website may contain links to other websites, such as hospitals or clinics. These websites have their own privacy policies, and we are not responsible for their content or practices.",
      "We recommend reviewing their privacy policies before sharing any information.",
    ],
  },
  {
    number: "10",
    title: "Updates to This Policy",
    bullets: [
      "We may update this Privacy Policy from time to time. Any important changes will be posted on this page with a new effective date.",
      "By continuing to use our website, you accept the updated policy.",
    ],
  },
];

function SectionBadge({ number }) {
  return (
    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-sm font-bold border border-orange-200">
      {number}
    </span>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2.5 mt-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm md:text-[15px] leading-relaxed">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ children }) {
  return (
    <div className="mt-4 pl-4 border-l-[3px] border-orange-500 bg-orange-50/50 rounded-r-lg py-2.5 pr-4">
      <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed">{children}</p>
    </div>
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
      {section.callout && <Callout>{section.callout}</Callout>}

      {section.subsections?.map((sub, i) => (
        <div key={i} className={`${i > 0 ? "mt-5 pt-5 border-t border-slate-100" : "mt-3"}`}>
          <h3 className="font-semibold text-[15px] text-slate-800 mb-1.5">{sub.title}</h3>
          {sub.intro && <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed">{sub.intro}</p>}
          {sub.paragraphs?.map((p, j) => (
            <p key={j} className="text-sm md:text-[15px] text-slate-600 leading-relaxed mb-2">{p}</p>
          ))}
          {sub.bullets && <BulletList items={sub.bullets} />}
          {sub.callout && <Callout>{sub.callout}</Callout>}
        </div>
      ))}
    </motion.div>
  );
}

export default function PrivacyPolicy() {
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-orange-500 text-xs font-medium mb-4">
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
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-orange-500 text-sm md:text-base"
          >
            Effective Date: July 15, 2026 · Alhind Medical Care
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-6 sm:py-8 -mt-6 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 flex gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed">
              This policy applies to all users of the Alhind Medical Care website and services. Please read it carefully. If you have any questions, contact us at{" "}
              <a href={`mailto:${s?.email || "support@alhindmedical.com"}`} className="text-orange-500 font-medium hover:underline">
                {s?.email || "support@alhindmedical.com"}
              </a>{" "}
              or call{" "}
              <a href={getTelLink(s?.phone)} className="text-orange-500 font-medium hover:underline">
                {s?.phone || "+918830681496"}
              </a>.
            </p>
          </motion.div>

          {SECTIONS.map((section) => (
            <SectionCard key={section.number} section={section} />
          ))}
        </div>
      </section>

      {/* Contact section */}
      <section className="relative overflow-hidden bg-secondary py-10 sm:py-12 md:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-bold">
                11
              </span>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-white">Contact Information</h2>
            </div>
            <p className="text-white/80 text-sm md:text-base">Have questions about this policy? We're here to help.</p>
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