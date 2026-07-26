import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass rounded-2xl p-4 sm:p-6 text-center hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2.5 sm:mb-3 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center ring-1 ring-primary/10">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
      </div>
      {/* FIX: fixed text-3xl could overflow/wrap awkwardly on narrow 2-column mobile
          grids for longer values like "1,00,000+". Now scales down on small screens. */}
      <div className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-foreground mb-1 break-words">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}