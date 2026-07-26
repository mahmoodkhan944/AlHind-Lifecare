import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Youtube, Linkedin, Facebook, Instagram, Twitter, MessageCircle, ChevronRight } from "lucide-react";
import { useSiteSettings, getWhatsAppLink, getTelLink } from "@/hooks/useSiteSettings";
import { LOGO_URL } from "@/lib/brand-assets";
import { db } from "@/api/dataClient";

// Fallback text-only links (search by name) shown only until real featured
// Hospital/Treatment records are marked "featured" in the admin panel.
const fallbackHospitalNames = [
  "Fortis Escorts Heart Institute",
  "Indraprastha Apollo Hospital",
  "BLK-Max Super Speciality Hospital",
  "Artemis Hospital, Gurugram",
];
const fallbackTreatmentNames = ["Orthopedics/Spine Surgery", "Hematology / Oncology", "Cardiology", "Gastroenterology"];

export default function Footer() {
  const { data: s } = useSiteSettings();
  const [descExpanded, setDescExpanded] = useState(false);
  const [topHospitals, setTopHospitals] = useState(null);
  const [topTreatments, setTopTreatments] = useState(null);

  useEffect(() => {
    // Pulls real, admin-managed records instead of a hardcoded name list — mark
    // a hospital/treatment "Featured" in the admin panel to have it show here,
    // and it'll link straight to that record's own page.
    db.entities.Hospital.filter({ status: "active", featured: true }, "-created_date", 6)
      .then((data) => setTopHospitals(data.length > 0 ? data : null))
      .catch(() => setTopHospitals(null));
    db.entities.Treatment.filter({ status: "active", featured: true }, "-created_date", 4)
      .then((data) => setTopTreatments(data.length > 0 ? data : null))
      .catch(() => setTopTreatments(null));
  }, []);

  const socials = [
    { Icon: Youtube, url: s?.youtube_url },
    { Icon: Linkedin, url: s?.linkedin_url },
    { Icon: Facebook, url: s?.facebook_url },
    { Icon: Instagram, url: s?.instagram_url },
    { Icon: Twitter, url: s?.twitter_url },
  ].filter((x) => x.url);

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms & Conditions", path: "/terms" },
    { label: "Disclaimer", path: "/terms" },
  ];

  return (
    <footer className="bg-secondary/20 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand + description */}
          <div className="lg:col-span-1">
            <img
              src={LOGO_URL}
              alt="Alhind Medical Care"
              className="h-12 w-auto rounded-lg mb-4"
            />
            <p className={`text-xs text-muted-foreground leading-relaxed ${descExpanded ? "" : "line-clamp-4"}`}>
              Alhind Medical Care acts solely as a medical tourism facilitator and does not provide medical
              advice, diagnosis, or treatment. All healthcare services are rendered exclusively by independent
              hospitals and medical professionals.
            </p>
            <button
              onClick={() => setDescExpanded((v) => !v)}
              className="text-xs font-semibold text-primary hover:underline mt-2 flex items-center gap-1"
            >
              {descExpanded ? "View Less" : "View More"}{" "}
              <ChevronRight className={`w-3 h-3 transition-transform ${descExpanded ? "-rotate-90" : "rotate-90"}`} />
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.path} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                    <ChevronRight className="w-3 h-3" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground mb-4">Get In Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {s?.address || "Abul Fazal Enclave, New Delhi, India"}
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={getTelLink(s?.phone)} className="hover:text-primary transition-colors">
                  {s?.phone || "+91-7394966566"}
                </a>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`mailto:${s?.email || "support@alhindmedical.com"}`} className="hover:text-primary transition-colors">
                  {s?.email || "support@alhindmedical.com"}
                </a>
              </li>
            </ul>
          </div>

          {/* Top Hospitals */}
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground mb-4">Top Hospitals</h4>
            <ul className="space-y-2">
              {(topHospitals || fallbackHospitalNames).map((h) => (
                <li key={h.id || h}>
                  <Link
                    to={h.id ? `/hospitals/${h.id}` : `/hospitals?q=${encodeURIComponent(h)}`}
                    className="flex items-start gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" /> {h.name || h}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Treatments */}
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground mb-4">Top Treatments</h4>
            <ul className="space-y-2">
              {(topTreatments || fallbackTreatmentNames).map((t) => (
                <li key={t.id || t}>
                  <Link
                    to={t.id ? `/treatments/${t.id}` : `/treatments?q=${encodeURIComponent(t)}`}
                    className="flex items-start gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" /> {t.name || t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-footer */}
      <div className="text-primary-foreground">
        <div className="bg-black max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-5">
              <a href={`mailto:${s?.email || "support@alhindmedical.com"}`} className="flex items-center gap-1.5 text-xs hover:text-secondary transition-colors">
                <Mail className="w-3.5 h-3.5" /> {s?.email || "support@alhindmedical.com"}
              </a>
              <a href={getTelLink(s?.phone)} className="flex items-center gap-1.5 text-xs hover:text-secondary transition-colors">
                <Phone className="w-3.5 h-3.5" /> {s?.phone || "+91-7394966566"}
              </a>
              <a
                href={getWhatsAppLink(s?.whatsapp_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary text-xs font-semibold hover:bg-secondary/80 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Chat Now
              </a>
            </div>
            {socials.length > 0 && (
              <div className="flex gap-2">
                {socials.map(({ Icon, url }, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-primary flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-border py-3 text-center">
          <p className="text-xs text-black">
            © {new Date().getFullYear()} Alhind Medical Care. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}