import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Building2 } from "lucide-react";
import { db } from "@/api/dataClient";
import { useSectionContent } from "@/hooks/useSectionContent";
import { homePicks } from "@/lib/homePicks";
import { isHiddenCountry } from "@/lib/siteConfig";
import { hospitalRegion } from "@/lib/regions";

const fallback = {
  India: [
    { id: "1", name: "Medanta - The Medicity", city: "Gurugram", country: "India", cover_image_url: "https://images.unsplash.com/photo-1538108149393-fbbd8181549e?w=600&q=80" },
    { id: "2", name: "Apollo Hospitals", city: "Chennai", country: "India", cover_image_url: "https://images.unsplash.com/photo-1583912267550-d44c9c4d3a30?w=600&q=80" },
    { id: "3", name: "Indraprastha Apollo", city: "New Delhi", country: "India", cover_image_url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80" },
    { id: "4", name: "Kokilaben Hospital", city: "Mumbai", country: "India", cover_image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80" },
  ],
  Turkey: [
    { id: "5", name: "Memorial Hospital", city: "Istanbul", country: "Turkey", cover_image_url: "https://images.unsplash.com/photo-1538108149393-fbbd8181549e?w=600&q=80" },
    { id: "6", name: "Acibadem Hospital", city: "Istanbul", country: "Turkey", cover_image_url: "https://images.unsplash.com/photo-1583912267550-d44c9c4d3a30?w=600&q=80" },
    { id: "7", name: "MedicalPark", city: "Istanbul", country: "Turkey", cover_image_url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80" },
  ],
};

const config = {
  India: {
    code: "IN",
    flag: "https://flagcdn.com/w40/in.png",
    subtitle: "International Healthcare Destination",
    description:
      "Internationally accredited hospitals offering advanced treatments and experienced medical specialists.",
    bgGradient: "from-[hsl(var(--accent-warm)/0.06)] to-accent-jade/5",
  },

  Turkey: {
    code: "TR",
    flag: "https://flagcdn.com/w40/tr.png",
    subtitle: "International Healthcare Destination",
    description:
      "Premium medical facilities providing advanced treatments and world-class international patient care.",
    bgGradient: "from-red-50/40 to-rose-50/30",
  },
};

const PER_CARD = 2;

// Hospitals the admin marked "Show on Homepage" first, then the newest.
const homeOrder = (a, b) =>
  Number(!!b.show_on_home) - Number(!!a.show_on_home) ||
  String(b.created_date || "").localeCompare(String(a.created_date || ""));

// India → one card per region (Delhi NCR, Mumbai, …), each with 2 hospitals.
// Regions with more hospitals come first.
function groupByRegion(list) {
  const map = new Map();
  [...list].sort(homeOrder).forEach((h) => {
    const region = hospitalRegion(h);
    const key = region.toLowerCase();
    if (!map.has(key)) map.set(key, { region, items: [] });
    map.get(key).items.push(h);
  });
  return [...map.values()].sort((a, b) => b.items.length - a.items.length || a.region.localeCompare(b.region));
}

export default function HospitalsByCountry() {
  const [india, setIndia] = useState(fallback.India);
  const [turkey, setTurkey] = useState(fallback.Turkey);
  const header = useSectionContent("home_hospitals_header", {
    badge: "Medical Destinations",
    heading: "Global Healthcare Destinations",
    subtitle: "JCI-accredited facilities with cutting-edge technology and world-class specialists",
  });

  useEffect(() => {
    db.entities.Hospital.filter({ status: "active", country: "India" }, "-created_date", 500)
      .then((data) => { if (data.length > 0) setIndia(data); })
      .catch(() => {});
    if (!isHiddenCountry("Turkey")) {
      homePicks(db.entities.Hospital, { status: "active", country: "Turkey" }, "-created_date", PER_CARD, () =>
        db.entities.Hospital.filter({ status: "active", country: "Turkey" }, "-created_date", PER_CARD)
      )
        .then((data) => { if (data.length > 0) setTurkey(data); })
        .catch(() => {});
    }
  }, []);

  const cards = [
    ...groupByRegion(india).map((g) => ({
      key: `in-${g.region}`,
      cfg: config.India,
      title: g.region,
      label: "India",
      items: g.items,
      total: g.items.length,
      link: `/hospitals?region=${encodeURIComponent(g.region)}`,
    })),
    // Countries switched off in src/lib/siteConfig.js (e.g. Turkey) are not shown.
    ...(isHiddenCountry("Turkey") || turkey.length === 0
      ? []
      : [{ key: "tr", cfg: config.Turkey, title: "Turkey", label: "", items: turkey, total: null, link: "/hospitals" }]),
  ];

  return (
    <section className="py-6 sm:py-8 md:py-10 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-3">
            {header.badge}
          </span>
          <h2 className="font-heading font-extrabold text-xl sm:text-3xl md:text-4xl text-secondary mb-2 whitespace-nowrap">{header.heading}</h2>
          <p className="text-muted-foreground text-base max-w-3xl mx-auto lg:whitespace-nowrap">
            {header.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 3) * 0.1 }}
              className="relative bg-white rounded-3xl shadow-lg shadow-black/5 border border-border/60 overflow-hidden flex flex-col"
            >
              {/* Badge — number of hospitals in this region */}
              {card.total > 0 && (
                <div className="absolute top-4 right-4 z-10 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-secondary to-accent-jade text-white font-heading font-bold text-xs sm:text-sm shadow-md">
                  {card.total} {card.total === 1 ? "Hospital" : "Hospitals"}
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 p-4 sm:p-5 pb-3 pr-32">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-border shadow-md flex items-center justify-center shrink-0">
                  <img src={card.cfg.flag} alt="" className="w-8 h-6 object-cover rounded shadow-sm" loading="lazy" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-gray-400 tracking-wider">{card.cfg.code}</span>
                    <h3 className="font-heading font-extrabold text-xl text-secondary truncate">{card.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 font-medium truncate">
                    {card.label ? `${card.label} · ${card.cfg.subtitle}` : card.cfg.subtitle}
                  </p>
                </div>
              </div>

              {/* 2 hospitals */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 px-4 sm:px-5">
                {card.items.slice(0, PER_CARD).map((h) => (
                  <Link key={h.id} to={`/hospitals/${h.id}`} className="group block min-w-0">
                    <div className="rounded-xl overflow-hidden bg-gray-50 aspect-[4/3]">
                      {h.cover_image_url ? (
                        <img src={h.cover_image_url} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-secondary mt-2 line-clamp-1">{h.name}</h4>
                    <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-accent-jade shrink-0" /> <span className="truncate">{h.city}</span>
                    </span>
                  </Link>
                ))}
              </div>

              {/* Button */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-4 mt-auto">
                <Link
                  to={card.link}
                  className="flex items-center justify-between w-full px-5 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <span className="font-heading font-semibold text-xs sm:text-sm text-secondary truncate">View Hospitals in {card.title}</span>
                  <ArrowRight className="w-4 h-4 text-secondary shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}