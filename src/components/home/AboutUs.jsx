import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/common/SectionHeader";

export default function AboutUs() {
  return (
    <section className="relative py-10 sm:py-12 md:py-16 bg-secondary/30 overflow-hidden">
      {/* Decorative graphics — subtle coral + navy glows for visual depth */}
      <div className="decor-blob decor-blob-primary w-80 h-80 -top-24 -left-24" />
      <div className="decor-blob decor-blob-secondary w-72 h-72 -bottom-20 -right-20" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader badge="About Us" center />
          <h3 className="font-heading font-bold text-lg md:text-xl text-foreground mb-2 leading-snug">
            Leading Medical Tourism Services for World-Class Healthcare in India
          </h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
            At Alhind Medical Care, our mission is to connect international patients with world-class hospitals
            and renowned doctors in India and Turkey. We provide end-to-end assistance — from medical opinion
            and cost estimates to travel arrangements, hospital coordination, and post-treatment follow-up —
            ensuring a seamless and stress-free healthcare journey for every patient.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            More About Us <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}