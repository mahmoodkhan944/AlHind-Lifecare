import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { HeartPulse as HeartPulseFallback } from "lucide-react";
import { db } from "@/api/dataClient";
import SectionHeader from "@/components/common/SectionHeader";

// Fallback shown only if no admin-managed items exist yet for this section
// (e.g. before the site_content_migration.sql seed has been run).
const fallbackServices = [
  { title: "Free Medical Opinion & Second Opinion", icon: "HeartPulse" },
  { title: "End-to-End Treatment Coordination", icon: "ShieldCheck" },
  { title: "Visa & Travel Assistance", icon: "Globe2" },
  { title: "Airport Pickup and Drop", icon: "MapPin" },
  { title: "Accommodation & Stay Arrangements", icon: "Headphones" },
  { title: "24/7 Patient Support in Multiple Languages", icon: "Building2" },
  { title: "Expert Network of Top Indian Hospitals", icon: "Users" },
  { title: "Affordable & Transparent Pricing", icon: "Clock" },
  { title: "Money Exchange", icon: "DollarSign" },
  { title: "Interpreters & Translators", icon: "MessageSquare" },
  { title: "Pre-Travel Consultation", icon: "Plane" },
];

export default function OurServices() {
  const [services, setServices] = useState(fallbackServices);

  useEffect(() => {
    // Admin-editable via /admin/site-content → "Our Services".
    db.entities.SiteContent.filter({ section: "services", status: "active" }, "sort_order", 50)
      .then((data) => {
        if (data.length > 0) setServices(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader badge="Our Services" title="Everything Handled, So You Don't Have To" center />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {services.map((s, i) => {
            const Icon = (s.icon && Icons[s.icon]) || HeartPulseFallback;
            return (
              <motion.div
                key={s.id || s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 bg-white rounded-2xl border border-border/40 p-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                </div>
                <p className="font-heading font-semibold text-sm text-foreground leading-snug pt-1.5">{s.title}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}