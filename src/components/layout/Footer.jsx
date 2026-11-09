import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Phone, PhoneCall, Mail, Youtube, Linkedin, Facebook, Instagram, Twitter,
  MessageCircle, ChevronRight, Layers, Hospital, Stethoscope,
} from "lucide-react";
import { useSiteSettings, getWhatsAppLink, getTelLink } from "@/hooks/useSiteSettings";
import { LOGO_URL } from "@/lib/brand-assets";
import { db } from "@/api/dataClient";
import { treatmentUrl } from "@/lib/slugify";

// Fallback text-only links (search by name) shown only until real featured
// Hospital/Treatment records are marked "featured" in the admin panel.
const fallbackHospitalNames = [
  "Fortis Escorts Heart Institute",
  "Indraprastha Apollo Hospital",
  "BLK-Max Super Speciality Hospital",
  "Artemis Hospital, Gurugram",
];
const fallbackTreatmentNames = ["Orthopedics/Spine Surgery", "Hematology / Oncology", "Cardiology", "Gastroenterology"];

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Treatment Packages", path: "/packages" },
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms & Conditions", path: "/terms" },
  { label: "Disclaimer", path: "/terms" },
];

// Column heading with a brand-red icon (Quick Links, Get In Touch, …).
function ColumnTitle({ icon: Icon, children }) {
  return (
    <h4 className="flex items-center gap-2.5 font-heading font-extrabold text-lg text-secondary mb-5 whitespace-nowrap">
      <Icon className="w-6 h-6 text-primary shrink-0" strokeWidth={1.75} />
      {children}
    </h4>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="group flex items-start gap-2 text-sm text-foreground/80 hover:text-primary transition-colors">
        <ChevronRight className="w-4 h-4 text-primary/70 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
        <span>{children}</span>
      </Link>
    </li>
  );
}

export default function Footer() {
  const { data: s } = useSiteSettings();
  const [descExpanded, setDescExpanded] = useState(false);
  const [topHospitals, setTopHospitals] = useState(null);
  const [topTreatments, setTopTreatments] = useState(null);

  useEffect(() => {
    // Mark a hospital/treatment "Featured" in the admin panel to list it here.
    db.entities.Hospital.filter({ status: "active", featured: true }, "-created_date", 6)
      .then((data) => setTopHospitals(data.length > 0 ? data : null))
      .catch(() => setTopHospitals(null));
    db.entities.Treatment.filter({ status: "active", featured: true }, "-created_date", 5)
      .then((data) => setTopTreatments(data.length > 0 ? data : null))
      .catch(() => setTopTreatments(null));
  }, []);

  const email = s?.email || "support@alhindmedical.com";
  const phone = s?.phone || "+91-7394966566";

  const socials = [
    { Icon: Linkedin, url: s?.linkedin_url, label: "LinkedIn" },
    { Icon: Instagram, url: s?.instagram_url, label: "Instagram" },
    { Icon: Youtube, url: s?.youtube_url, label: "YouTube" },
    { Icon: Facebook, url: s?.facebook_url, label: "Facebook" },
    { Icon: Twitter, url: s?.twitter_url, label: "X / Twitter" },
  ].filter((x) => x.url);

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-white via-primary/[0.04] to-primary/[0.09] border-t border-border">
      {/* Soft decorative waves */}
      <svg aria-hidden="true" className="pointer-events-none absolute -bottom-10 left-0 w-[70%] max-w-3xl text-primary/[0.06]" viewBox="0 0 800 300" fill="currentColor">
        <path d="M0 140C160 60 300 220 470 180S720 220 800 300H0Z" />
      </svg>
      <svg aria-hidden="true" className="pointer-events-none absolute -top-6 right-0 w-[55%] max-w-2xl text-primary/[0.05]" viewBox="0 0 800 300" fill="currentColor">
        <path d="M800 0V170C640 250 520 90 360 120S120 60 0 0Z" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1.15fr_0.85fr_1.3fr_1.2fr_0.95fr] gap-y-9 gap-x-8 xl:gap-x-0 xl:divide-x xl:divide-border/70">
          {/* Brand + disclaimer */}
          <div className="sm:col-span-2 lg:col-span-4 xl:col-span-1 xl:pr-7">
            <img src={LOGO_URL} alt="Alhind Medical Care" className="h-16 w-auto mb-5" />
            <p className={`text-sm text-foreground/80 leading-relaxed max-w-xl ${descExpanded ? "" : "line-clamp-5"}`}>
              Alhind Medical Care acts solely as a medical tourism facilitator and does not provide medical
              advice, diagnosis, or treatment. All healthcare services are delivered by partner hospitals and
              doctors, who are independently responsible for the care they provide.
            </p>
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-5 inline-flex items-center gap-1 px-6 py-2 rounded-full border-2 border-primary/70 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              {descExpanded ? "View Less" : "View More"}
              <ChevronRight className={`w-4 h-4 transition-transform ${descExpanded ? "-rotate-90" : ""}`} />
            </button>
          </div>

          {/* Quick Links */}
          <div className="xl:px-7">
            <ColumnTitle icon={Layers}>Quick Links</ColumnTitle>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <FooterLink key={l.label} to={l.path}>{l.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="xl:px-7">
            <ColumnTitle icon={PhoneCall}>Get In Touch</ColumnTitle>
            <ul className="space-y-4 text-sm text-foreground/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
                <span className="leading-relaxed">{s?.address || "Abul Fazal Enclave, New Delhi, India"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" strokeWidth={1.75} />
                <a href={getTelLink(s?.phone)} className="hover:text-primary transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-3 min-w-0">
                <Mail className="w-5 h-5 text-primary shrink-0" strokeWidth={1.75} />
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors [overflow-wrap:anywhere]">{email}</a>
              </li>
            </ul>
          </div>

          {/* Top Hospitals */}
          <div className="xl:px-7">
            <ColumnTitle icon={Hospital}>Top Hospitals</ColumnTitle>
            <ul className="space-y-3">
              {(topHospitals || fallbackHospitalNames).map((h) => (
                <FooterLink key={h.id || h} to={h.id ? `/hospitals/${h.id}` : `/hospitals?q=${encodeURIComponent(h)}`}>
                  {h.name || h}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Top Treatments */}
          <div className="xl:pl-7">
            <ColumnTitle icon={Stethoscope}>Top Treatments</ColumnTitle>
            <ul className="space-y-3">
              {(topTreatments || fallbackTreatmentNames).map((t) => (
                <FooterLink key={t.id || t} to={t.id ? treatmentUrl(t) : `/treatments?q=${encodeURIComponent(t)}`}>
                  {t.name || t}
                </FooterLink>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact bar */}
        <div className="mt-10 mb-8 rounded-2xl bg-secondary text-white px-5 sm:px-8 py-4 shadow-lg shadow-secondary/20">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-0">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-0 flex-1">
              <a href={`mailto:${email}`} className="flex items-center gap-2.5 font-semibold text-sm sm:text-base hover:text-white/80 transition-colors sm:pr-6 min-w-0">
                <Mail className="w-5 h-5 shrink-0" /> <span className="truncate">{email}</span>
              </a>
              <a href={getTelLink(s?.phone)} className="flex items-center gap-2.5 font-semibold text-sm sm:text-base hover:text-white/80 transition-colors sm:px-6 sm:border-l sm:border-white/25">
                <Phone className="w-5 h-5 shrink-0" /> {phone}
              </a>
              <a
                href={getWhatsAppLink(s?.whatsapp_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start sm:self-auto sm:ml-2 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-secondary text-sm font-bold hover:bg-white/90 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Chat Now
              </a>
            </div>
            {socials.length > 0 && (
              <div className="flex items-center gap-3 lg:pl-8 lg:border-l lg:border-white/25">
                <span className="font-semibold text-sm sm:text-base whitespace-nowrap">Follow Us :</span>
                <div className="flex gap-2.5">
                  {socials.map(({ Icon, url, label }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 rounded-full bg-white text-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative bg-muted/70 border-t border-border/60 py-4 text-center">
        <p className="text-sm text-foreground/70">
          © {new Date().getFullYear()} Alhind Medical Care. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}