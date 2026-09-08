import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PhoneCall as PhoneCallFallback } from "lucide-react";
import { db } from "@/api/dataClient";
import SectionHeader from "@/components/common/SectionHeader";
import { useSectionContent } from "@/hooks/useSectionContent";
import IconOrImage from "@/components/common/IconOrImage";

// Fallback shown only if no admin-managed items exist yet for this section
// (e.g. before the site_content_migration.sql seed has been run).
const fallbackSteps = [
  { title: "Contact Us", description: "Contact us, share your case details and our team will get in touch with you.", icon: "PhoneCall" },
  { title: "Medical Opinion", description: "Receive medical opinion and cost estimate within 48 Hours.", icon: "FileText" },
  { title: "Travel Arrangements", description: "Book flights and get received by our team at the airport.", icon: "Plane" },
  { title: "Treatment & Follow-up", description: "Get treated and fly back. We stay in touch for follow ups.", icon: "ClipboardCheck" },
];

export default function HowWeWork() {
  const [steps, setSteps] = useState(fallbackSteps);
  const header = useSectionContent("home_how_we_work_header", {
    badge: "Process",
    heading: "How Do We Work?",
    subtitle: "Your journey to better health in four simple steps",
  });

  useEffect(() => {
    // Admin-editable via /admin/home-content → "How Do We Work? (Steps List)".
    db.entities.SiteContent.filter({ section: "process_steps", status: "active" }, "sort_order", 50)
      .then((data) => {
        if (data.length > 0) setSteps(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-4 sm:py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader badge={header.badge} title={header.heading} subtitle={header.subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, i) => {
            return (
              <motion.div
                key={step.id || step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-border/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-[#C22E44] flex items-center justify-center text-white font-heading font-bold text-xs sm:text-sm shadow-lg shadow-primary/20">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconOrImage value={step.icon} fallback={PhoneCallFallback} className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-bold text-base text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}