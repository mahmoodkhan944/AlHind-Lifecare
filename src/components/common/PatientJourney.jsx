import React from "react";
import { motion } from "framer-motion";
import { Route } from "lucide-react";

/**
 * "How International Patients Can Reach … Through AlHind Lifecare" heading,
 * then a card titled "International Patient Journey" with numbered steps
 * joined by a line. Used on doctor and treatment pages.
 */
export default function PatientJourney({ heading, title, steps }) {
  if (!steps || steps.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      {heading && <h2 className="font-heading font-bold text-lg sm:text-xl mb-3 text-balance">{heading}</h2>}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
            <Route className="w-4.5 h-4.5" />
          </span>
          <h3 className="font-heading font-bold text-base sm:text-lg">{title}</h3>
        </div>
        <ol>
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={i} className="relative flex gap-3.5 sm:gap-4">
                {/* Number + the line down to the next step */}
                <div className="flex flex-col items-center shrink-0">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm shadow-sm shadow-primary/30">
                    {i + 1}
                  </span>
                  {!last && <span className="w-0.5 flex-1 bg-primary/15 my-1" aria-hidden="true" />}
                </div>
                <div className={`min-w-0 pt-1 ${last ? "" : "pb-5"}`}>
                  {step.title && (
                    <p className="font-heading font-bold text-sm sm:text-base text-foreground">
                      <span className="text-primary">Step {i + 1}</span> – {step.title}
                    </p>
                  )}
                  {step.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1 whitespace-pre-line">{step.description}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </motion.div>
  );
}