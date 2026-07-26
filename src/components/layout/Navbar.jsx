import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "@/components/common/LanguageSelector";
import SmartSearch from "@/components/common/SmartSearch";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { LOGO_URL } from "@/lib/brand-assets";
import { useLeadModal } from "@/lib/LeadModalContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Treatments", path: "/treatments" },
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
  const { data: s } = useSiteSettings();
  const { openLeadModal } = useLeadModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-primary/5" : "bg-transparent"
      }`}
    >
      {/* Subtle brand accent line — only visible once scrolled, ties the nav to
          the same coral CTA color used everywhere else on the site. */}
      {scrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center">
            <img
              src={LOGO_URL}
              alt="AlHind Lifecare — Your Trusted Healthcare Facilitator"
              className="h-10 md:h-12 w-auto rounded-lg"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? scrolled ? "text-primary bg-primary/10" : "text-white bg-white/20"
                    : scrolled ? "text-foreground/70 hover:text-primary hover:bg-primary/5" : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <SmartSearch scrolled={scrolled} />
            <LanguageSelector light={!scrolled} />
            
            <Button
              onClick={() => openLeadModal({ title: "Free Consultation" })}
              className="bg-gradient-to-r from-primary to-secondary text-white rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all font-semibold"
            >
              Free Consultation
            </Button>
          </div>

          <div className="lg:hidden flex items-center gap-1">
            <SmartSearch scrolled={scrolled} />
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`p-2 rounded-lg ${scrolled ? "text-foreground" : "text-white"}`}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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
                <LanguageSelector />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t">
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