import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { db } from "@/api/dataClient";

const fallback = [
  {
    id: "1",
    patient_name: "Lison Tafadzwa Shumba",
    country: "Zimbabwe",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    treatment: "Aortic Valve Replacement Surgery",
    hospital: "Metro Heart Institute",
    rating: 5,
    review_text: "I was advised to undergo Aortic Valve Replacement surgery and contacted Alhind Medical Care for help. From online consultations and visa assistance to hospital arrangements and support in India, their team helped me at every step. Through Alhind Medical Care, I met Dr. Vishal Dhir at Metro Heart Institute, where my surgery was successfully completed. I am especially thankful to Mr. Mohd Ashraf for his support, guidance, and personal care throughout the journey. I truly appreciate the honest support and services provided by Alhind Medical Care.",
  },
];

export default function Testimonials() {
  const [items, setItems] = useState(fallback);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    db.entities.Testimonial.filter({ status: "approved", featured: true }, "-created_date", 10)
      .then((data) => { if (data.length > 0) setItems(data); })
      .catch(() => {});
  }, []);

  const t = items[idx] || fallback[0];
  const prev = () => setIdx((p) => (p - 1 + items.length) % items.length);
  const next = () => setIdx((p) => (p + 1) % items.length);

  return (
    <section className="py-10 sm:py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-wider uppercase text-primary mb-1 block">Testimonials</span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground">What Our Patients Say</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Stories of Healing and Trust From Our Valued Patients</p>
        </div>

        <div className="bg-white rounded-3xl border border-border/40 p-6 sm:p-10 shadow-lg shadow-primary/5">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 items-center"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < (t.rating || 5) ? "text-accent fill-accent" : "text-muted"}`} />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-secondary mb-3" />
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">{t.review_text}</p>
                <h4 className="font-heading font-bold text-base text-foreground">{t.patient_name}</h4>
                <p className="text-xs text-muted-foreground">
                  {t.treatment || "AVR Surgery"} • {t.hospital || "Metro Heart Institute"}
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted border-2 border-secondary flex-shrink-0">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.patient_name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                      {t.patient_name?.[0]}
                    </div>
                  )}
                </div>
                <p className="font-heading font-semibold text-sm text-foreground mt-3">{t.patient_name}</p>
                <p className="text-xs text-muted-foreground">{t.country}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              <button onClick={prev} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-2 bg-muted"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}