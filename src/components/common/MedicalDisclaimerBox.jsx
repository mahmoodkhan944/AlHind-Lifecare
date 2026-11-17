import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { MEDICAL_DISCLAIMER_TEXT, DISCLAIMER_SECTION_TITLE } from "@/lib/patientJourney";

/** Amber "Medical Disclaimer" box with a link to the full disclaimer page. */
export default function MedicalDisclaimerBox({ title = DISCLAIMER_SECTION_TITLE }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
      <h3 className="flex items-center gap-2 font-heading font-bold text-base sm:text-lg text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" /> {title}
      </h3>
      <p className="mt-2 text-sm text-amber-900/80 leading-relaxed">{MEDICAL_DISCLAIMER_TEXT}</p>
      <Link
        to="/medical-disclaimer"
        className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-amber-700 hover:text-amber-900 hover:underline"
      >
        Read full Medical Disclaimer <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}