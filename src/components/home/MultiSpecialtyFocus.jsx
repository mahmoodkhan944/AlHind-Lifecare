import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Plus, Stethoscope as StethoscopeFallback } from "lucide-react";
import { db } from "@/api/dataClient";

// Fallback shown only if no admin-managed items exist yet for this section
// (e.g. before the site_content_migration.sql seed has been run).
const fallbackSpecialties = [
  { title: "Oncology", icon: "Ribbon", link: "/treatments" },
  { title: "Neurosurgery", icon: "Brain", link: "/treatments" },
  { title: "Spine Surgery", icon: "Activity", link: "/treatments" },
  { title: "Cardiology", icon: "HeartPulse", link: "/treatments" },
  { title: "Gynecology", icon: "Baby", link: "/treatments" },
  { title: "Cosmetic", icon: "Smile", link: "/treatments" },
  { title: "Weight Loss", icon: "Scale", link: "/treatments" },
  { title: "Liver Transplant", icon: "Droplet", link: "/treatments" },
  { title: "Kidney Transplant", icon: "Stethoscope", link: "/treatments" },
  { title: "Bone Marrow", icon: "Bone", link: "/treatments" },
];

export default function MultiSpecialtyFocus() {
  const [specialties, setSpecialties] = useState(fallbackSpecialties);

  useEffect(() => {
    // Admin-editable via /admin/site-content → "Multi-Specialty Focus".
    db.entities.SiteContent.filter({ section: "specialties", status: "active" }, "sort_order", 50)
      .then((data) => {
        if (data.length > 0) setSpecialties(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-3">
            Featured Treatments
          </span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-foreground mb-2">Multi-Specialty Focus</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            We cover all medical needs, from hair transplants to heart transplants.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {specialties.map((s, i) => {
            const Icon = (s.icon && Icons[s.icon]) || StethoscopeFallback;
            return (
              <motion.div
                key={s.id || s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden hover-lift hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="flex items-center justify-center py-4 sm:py-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-secondary" strokeWidth={1.8} />
                  </div>
                </div>
                <Link
                  to={s.link || "/treatments"}
                  className="flex items-center justify-between gap-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-secondary hover:bg-secondary/90 transition-colors group"
                >
                  <span className="text-white font-heading font-semibold text-xs sm:text-sm text-center flex-1">{s.title}</span>
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                    <Plus className="w-3 h-3 text-white" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}