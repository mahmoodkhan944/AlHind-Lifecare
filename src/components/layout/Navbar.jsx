import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "@/components/common/LanguageSelector";
import SmartSearch from "@/components/common/SmartSearch";
import { LOGO_URL } from "@/lib/brand-assets";
import { useLeadModal } from "@/lib/LeadModalContext";
import { useSiteSettings, getWhatsAppLink } from "@/hooks/useSiteSettings";

const WHATSAPP_TEXT = "?text=Hi%2C%20I%20need%20medical%20consultation";

function WhatsAppIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Treatments", path: "/treatments" },
  { label: "Packages", path: "/packages" },
  { label: "Doctors", path: "/doctors" },
  { label: "Hospitals", path: "/hospitals" },
  { label: "Blog", path: "/blog" },
  { label: "Testimonials", path: "/testimonials" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { openLeadModal } = useLeadModal();
  const { data: settings } = useSiteSettings();
  const whatsappHref = `${getWhatsAppLink(settings?.whatsapp_number)}${WHATSAPP_TEXT}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  // "Treatments" stays highlighted on /treatments/Neurology too
  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-lg shadow-secondary/10" : "shadow-sm"
      }`}
    >
      {/* Row 1 — slim white bar: logo · Get a FREE Quote · language.
          Mobile: logo · search icon · menu. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 h-14 lg:h-12">
          <Link to="/" className="flex items-center min-w-0">
            <img
              src={LOGO_URL}
              alt="AlHind Lifecare — Your Trusted Healthcare Facilitator"
              className="h-9 lg:h-10 w-auto max-w-[55vw] object-contain object-left"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-2.5">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-[#25D366] hover:bg-[#1fb757] text-white text-[13px] font-semibold shadow-sm shadow-[#25D366]/30 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" /> Chat on WhatsApp
            </a>
            <Button
              onClick={() => openLeadModal({ title: "Free Consultation" })}
              className="h-8 px-4 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-semibold shadow-sm shadow-primary/30"
            >
              Free Consultation
            </Button>
            <LanguageSelector fullName />
          </div>

          <div className="lg:hidden flex items-center gap-1 shrink-0">
            <SmartSearch scrolled />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-secondary hover:bg-muted"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 (desktop) — menu links + search, on the brand's dark teal */}
      <div className="hidden lg:block bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-end gap-4 xl:gap-6 h-11">
            <nav className="flex items-center gap-0.5 xl:gap-1 min-w-0">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-2 xl:px-3 py-1.5 text-[13px] xl:text-sm whitespace-nowrap transition-colors ${
                    isActive(link.path) ? "text-white font-bold" : "text-white/80 font-medium hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute left-2 right-2 xl:left-3 xl:right-3 -bottom-[7px] h-[3px] rounded-full bg-primary" />
                  )}
                </Link>
              ))}
            </nav>
            <div className="w-56 xl:w-72 shrink-0">
              <SmartSearch variant="inline" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-1">
              <div className="px-4 py-2 mb-1">
                <LanguageSelector fullName />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path) ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t space-y-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-full bg-[#25D366] hover:bg-[#1fb757] text-white text-sm font-semibold"
                >
                  <WhatsAppIcon className="w-4 h-4" /> Chat on WhatsApp
                </a>
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    openLeadModal({ title: "Free Consultation" });
                  }}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-full font-semibold"
                >
                  Free Consultation
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}