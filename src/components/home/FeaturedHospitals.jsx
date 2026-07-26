import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Users, Bed, ArrowRight } from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/common/SectionHeader";

export default function FeaturedHospitals() {
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    db.entities.Hospital.filter({ featured: true, status: "active" }, "-created_date", 6)
      .then(setHospitals).catch(() => {});
  }, []);

  if (hospitals.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 md:py-16 mesh-bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          badge="Partner Hospitals"
          title="World-Class Hospitals"
          subtitle="JCI accredited facilities equipped with the latest medical technology"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/hospitals/${h.id}`} className="group block bg-white rounded-3xl overflow-hidden border border-border/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-48 bg-gradient-to-br from-sky-100 via-teal-50 to-amber-50 overflow-hidden">
                  {h.cover_image_url ? (
                    <img src={h.cover_image_url} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-primary/30 to-secondary/30">{h.name?.[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    {h.logo_url && <img src={h.logo_url} alt="" className="w-10 h-10 rounded-xl object-contain border" />}
                    <div>
                      <h3 className="font-heading font-bold text-lg group-hover:text-primary transition-colors">{h.name}</h3>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {h.city}, {h.country}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/40">
                    {h.beds_count > 0 && <span className="flex items-center gap-1 font-medium"><Bed className="w-3.5 h-3.5 text-primary" /> {h.beds_count} Beds</span>}
                    {h.doctors_count > 0 && <span className="flex items-center gap-1 font-medium"><Users className="w-3.5 h-3.5 text-primary" /> {h.doctors_count} Doctors</span>}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/hospitals">
            <Button variant="outline" className="rounded-full px-8 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
              View All Hospitals <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}