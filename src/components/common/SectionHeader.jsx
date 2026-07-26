import React from "react";
import { motion } from "framer-motion";

export default function SectionHeader({ badge, title, subtitle, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-8 sm:mb-10 md:mb-12 ${center ? "text-center" : ""}`}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-xs font-bold tracking-wider uppercase mb-3 sm:mb-4 border border-primary/10">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary" />
          {badge}
        </span>
      )}
      {title && (
        <h2 className="font-heading font-extrabold text-[clamp(1.5rem,5vw,3rem)] text-foreground mb-3 sm:mb-4 leading-tight text-balance">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}