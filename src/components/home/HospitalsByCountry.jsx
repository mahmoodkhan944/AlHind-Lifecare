import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Building2 } from "lucide-react";
import { db } from "@/api/dataClient";

const fallback = {
  India: [
    {
      id: "1",
      name: "Medanta - The Medicity",
      city: "Gurugram",
      country: "India",
      cover_image_url:
        "https://images.unsplash.com/photo-1538108149393-fbbd8181549e?w=600&q=80",
    },
    {
      id: "2",
      name: "Apollo Hospitals",
      city: "Chennai",
      country: "India",
      cover_image_url:
        "https://images.unsplash.com/photo-1583912267550-d44c9c4d3a30?w=600&q=80",
    },
    {
      id: "3",
      name: "Indraprastha Apollo",
      city: "New Delhi",
      country: "India",
      cover_image_url:
        "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80",
    },
    {
      id: "4",
      name: "Kokilaben Hospital",
      city: "Mumbai",
      country: "India",
      cover_image_url:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
    },
  ],
  Turkey: [
    {
      id: "5",
      name: "Memorial Hospital",
      city: "Istanbul",
      country: "Turkey",
      cover_image_url:
        "https://images.unsplash.com/photo-1538108149393-fbbd8181549e?w=600&q=80",
    },
    {
      id: "6",
      name: "Acibadem Hospital",
      city: "Istanbul",
      country: "Turkey",
      cover_image_url:
        "https://images.unsplash.com/photo-1583912267550-d44c9c4d3a30?w=600&q=80",
    },
    {
      id: "7",
      name: "MedicalPark",
      city: "Istanbul",
      country: "Turkey",
      cover_image_url:
        "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80",
    },
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

export default function HospitalsByCountry() {
  const [hospitals, setHospitals] = useState(fallback);

  useEffect(() => {
    db.entities.Hospital.filter(
      { status: "active", country: "India" },
      "-created_date",
      4,
    )
      .then((data) => {
        if (data.length > 0)
          setHospitals((prev) => ({ ...prev, India: data.slice(0, 4) }));
      })
      .catch(() => {});
    db.entities.Hospital.filter(
      { status: "active", country: "Turkey" },
      "-created_date",
      4,
    )
      .then((data) => {
        if (data.length > 0)
          setHospitals((prev) => ({ ...prev, Turkey: data.slice(0, 4) }));
      })
      .catch(() => {});
  }, []);

  const sections = [
    { country: "India", items: hospitals.India || [] },
    { country: "Turkey", items: hospitals.Turkey || [] },
  ];

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-3">
            Medical Destinations
          </span>
          <h2 className="font-heading font-extrabold text-[20px] sm:text-[24px] md:text-[32px] lg:text-[clamp(2.8rem,4vw,3.75rem)] leading-[1.12] text-secondary mb-2 drop-shadow-lg whitespace-nowrap lg:whitespace-normal">
            Hospitals by Destination
          </h2>
          <p
            className="text-muted-foreground text-base sm:text-lg lg:text-xl font-medium max-w-xl mx-auto lg:mx-0 mb-5 leading-relaxed text-center lg:text-left text-pretty"
          >
            JCI-accredited facilities with cutting-edge technology and
            world-class specialists
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sec, i) => {
            const cfg = config[sec.country];
            const count =
              sec.items.length > 0 ? `${sec.items.length * 10}+` : "30+";
            return (
              <motion.div
                key={sec.country}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-white rounded-3xl shadow-lg shadow-black/5 border border-border/60 overflow-hidden`}
              >
                {/* Badge */}
                <div className="absolute top-4 right-4 z-10 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-secondary to-accent-jade text-white font-heading font-bold text-xs sm:text-sm shadow-md">
                  {count}
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 p-4 sm:p-5 pb-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-border shadow-md flex items-center justify-center">
                    <img
                      src={cfg.flag}
                      alt={`${sec.country} Flag`}
                      className="w-8 h-6 object-cover rounded shadow-sm"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-gray-400 tracking-wider">
                        {cfg.code}
                      </span>
                      <h3 className="font-heading font-extrabold text-xl text-secondary">
                        {sec.country}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {cfg.subtitle}
                    </p>
                  </div>
                </div>

                {/* Hospital thumbnails */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 px-4 sm:px-5">
                  {sec.items.slice(0, 2).map((h) => (
                    <Link
                      key={h.id}
                      to={`/hospitals/${h.id}`}
                      className="group block"
                    >
                      <div className="rounded-xl overflow-hidden bg-gray-50 aspect-[4/3]">
                        {h.cover_image_url ? (
                          <img
                            src={h.cover_image_url}
                            alt={h.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-secondary mt-2 line-clamp-1">
                        {h.name}
                      </h4>
                      <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-accent-jade" /> {h.city}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-center px-4 sm:px-5 mt-4 mb-4">
                  {cfg.description}
                </p>

                {/* Button */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <Link
                    to="/hospitals"
                    className="flex items-center justify-between w-full px-5 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <span className="font-heading font-semibold text-xs sm:text-sm text-secondary">
                      View Hospitals in {sec.country}
                    </span>
                    <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}