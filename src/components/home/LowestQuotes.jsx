import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bone, Heart, Brain, Activity, Stethoscope, Ribbon, Wind, Smile, Droplet, Baby, Shield, ArrowRight } from "lucide-react";
import SectionHeader from "@/components/common/SectionHeader";
import { db } from "@/api/dataClient";
import { useLeadModal } from "@/lib/LeadModalContext";

const iconMap = {
  "knee": Bone,
  "hip": Bone,
  "brain": Brain,
  "heart": Heart,
  "bypass": Heart,
  "valve": Activity,
  "breast": Ribbon,
  "lung": Wind,
  "rhinoplasty": Smile,
  "kidney": Droplet,
  "pediatric": Baby,
  "cervical": Shield,
  "hysterectomy": Stethoscope,
};

const getIcon = (name = "") => {
  const lower = name.toLowerCase();
  const key = Object.keys(iconMap).find((k) => lower.includes(k));
  return key ? iconMap[key] : Stethoscope;
};

const fallback = [
  { id: "1", name: "Knee Replacement", cost_range_usd: "3700" },
  { id: "2", name: "Hip Replacement", cost_range_usd: "5000" },
  { id: "3", name: "Brain Tumor", cost_range_usd: "4800" },
  { id: "4", name: "Heart Bypass Surgery", cost_range_usd: "4500" },
  { id: "5", name: "Valve Replacement", cost_range_usd: "7500" },
  { id: "6", name: "Breast Cancer", cost_range_usd: "5000" },
  { id: "7", name: "Lung Cancer", cost_range_usd: "5500" },
  { id: "8", name: "Rhinoplasty", cost_range_usd: "1700" },
  { id: "9", name: "Kidney Transplant", cost_range_usd: "14500" },
  { id: "10", name: "Pediatric Cardiac Surgery", cost_range_usd: "6000" },
  { id: "11", name: "Cervical Cancer", cost_range_usd: "4000" },
  { id: "12", name: "Hysterectomy", cost_range_usd: "2800" },
];

export default function LowestQuotes() {
  const [treatments, setTreatments] = useState(fallback);
  const { openLeadModal } = useLeadModal();

  useEffect(() => {
    db.entities.Treatment.filter({ status: "active", featured: true }, "-created_date", 12)
      .then((data) => { if (data.length > 0) setTreatments(data); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-10 sm:py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          badge="Lowest Quotes"
          title="Lowest Quotes Assured"
          subtitle="We constantly negotiate better prices and alternatives without compromising treatment quality."
          center
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {treatments.map((t, i) => {
            const Icon = getIcon(t.name);
            const price = t.cost_range_usd || t.cost_range || "—";
            return (
              <motion.div
                key={t.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-border/40 p-4 sm:p-5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-sm text-foreground mb-1 leading-snug">{t.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Starting <span className="font-bold text-primary">${price}</span>
                </p>
                <button
                  onClick={() => openLeadModal({ title: "Get Quote", description: `Get a free, no-obligation quote for ${t.name}.`, treatmentInterest: t.name })}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all"
                >
                  Get Quote <ArrowRight className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}