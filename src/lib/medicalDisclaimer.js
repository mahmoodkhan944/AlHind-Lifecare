import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import { BRAND_NAME } from "@/lib/patientJourney";

// Medical Disclaimer content — editable in Admin → Medical Disclaimer.
// Stored as rows of site_content_items (no extra table/columns needed):
//   medical_disclaimer_box       1 row: title = box heading, description = disclaimer text
//                                (shown on doctor/treatment pages and at the top of the page)
//   medical_disclaimer_header    1 row: title = page heading, description = line under it
//   medical_disclaimer_sections  many rows: title = section heading, description = its text
// Until an admin adds rows, the defaults below are shown.

export const DISCLAIMER_BOX_SECTION = "medical_disclaimer_box";
export const DISCLAIMER_HEADER_SECTION = "medical_disclaimer_header";
export const DISCLAIMER_SECTIONS_SECTION = "medical_disclaimer_sections";

export const DEFAULT_DISCLAIMER_BOX = {
  title: "Medical Disclaimer",
  description: `${BRAND_NAME} acts as a medical tourism and patient coordination facilitator. All medical evaluations, donor suitability assessments, treatment recommendations, transplant approvals and clinical decisions are made solely by the treating hospital and its qualified medical team. ${BRAND_NAME} does not independently provide medical diagnosis, treatment or medical approvals.`,
};

export const DEFAULT_DISCLAIMER_HEADER = {
  title: "Medical Disclaimer",
  description: `Last Updated: November 17, 2026 · ${BRAND_NAME}`,
};

// Section text: paragraphs are separated by a blank line; lines starting
// with "-" or "•" become bullet points.
export const DEFAULT_DISCLAIMER_SECTIONS = [
  {
    title: "Our Role",
    description: `${BRAND_NAME} acts as a medical tourism and patient coordination facilitator. We are not a hospital, clinic or medical provider.\n\nWe help international patients connect with independent hospitals and doctors, and coordinate reports, consultations, travel and stay.`,
  },
  {
    title: "No Medical Advice",
    description: "Information on this website — including doctor profiles, treatment pages, packages, blogs and FAQs — is for general information only.\n\nIt is not medical advice, diagnosis or treatment, and must not replace a consultation with a qualified healthcare professional.",
  },
  {
    title: "Clinical Decisions",
    description: `All medical evaluations, donor suitability assessments, treatment recommendations, transplant approvals and clinical decisions are made solely by the treating hospital and its qualified medical team.\n\n${BRAND_NAME} does not independently provide medical diagnosis, treatment or medical approvals.`,
  },
  {
    title: "Doctor & Hospital Information",
    description: "- Doctor and hospital details are based on information provided by the hospitals or publicly available sources.\n- Qualifications, experience, availability and affiliations may change without notice.\n- Patients should confirm all details directly with the hospital before making decisions.",
  },
  {
    title: "Treatment Outcomes",
    description: "- Every patient is different, and results vary from person to person.\n- No treatment outcome, recovery time or success is guaranteed.\n- Success rates and statistics shown on this website are indicative only and are not a promise of individual results.",
  },
  {
    title: "Costs & Estimates",
    description: "- Package prices and cost estimates are approximate.\n- The final treatment plan and cost are decided by the hospital after medical assessment.\n- Additional tests, longer stays or complications may change the final cost.",
  },
  {
    title: "Medical Visa",
    description: `${BRAND_NAME} helps coordinate hospital invitation letters where approved. The final visa decision rests with the relevant embassy or authorities.`,
  },
  {
    title: "Independent Providers",
    description: "All doctors and hospitals listed are independent. They are solely responsible for the medical care they provide, its quality and its outcomes.",
  },
];

/** Section text → blocks: [{ type: "p", text }] / [{ type: "ul", items }]. */
export function parseDisclaimerText(text) {
  const blocks = [];
  String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .forEach((chunk) => {
      const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
      let para = [];
      const flush = () => { if (para.length) { blocks.push({ type: "p", text: para.join(" ") }); para = []; } };
      lines.forEach((line) => {
        const m = line.match(/^[-•*]\s*(.+)$/);
        if (m) {
          flush();
          const last = blocks[blocks.length - 1];
          if (last?.type === "ul") last.items.push(m[1]);
          else blocks.push({ type: "ul", items: [m[1]] });
        } else {
          para.push(line);
        }
      });
      flush();
    });
  return blocks;
}

const DEFAULTS = {
  box: DEFAULT_DISCLAIMER_BOX,
  header: DEFAULT_DISCLAIMER_HEADER,
  sections: DEFAULT_DISCLAIMER_SECTIONS,
};

// One fetch per page load, shared by every box/page that needs it.
let cache = null;
function loadDisclaimer() {
  if (!cache) {
    const rows = (section) =>
      db.entities.SiteContent.filter({ section, status: "active" }, "sort_order", 100).catch(() => []);
    cache = Promise.all([rows(DISCLAIMER_BOX_SECTION), rows(DISCLAIMER_HEADER_SECTION), rows(DISCLAIMER_SECTIONS_SECTION)]).then(
      ([box, header, sections]) => ({
        box: box[0] ? { title: box[0].title || DEFAULT_DISCLAIMER_BOX.title, description: box[0].description || DEFAULT_DISCLAIMER_BOX.description } : DEFAULT_DISCLAIMER_BOX,
        header: header[0] ? { title: header[0].title || DEFAULT_DISCLAIMER_HEADER.title, description: header[0].description || "" } : DEFAULT_DISCLAIMER_HEADER,
        sections: sections.length > 0 ? sections.map((s) => ({ title: s.title, description: s.description || "" })) : DEFAULT_DISCLAIMER_SECTIONS,
      })
    );
  }
  return cache;
}

/** { box, header, sections } — defaults first, then the admin's content. */
export function useMedicalDisclaimer() {
  const [data, setData] = useState(DEFAULTS);
  useEffect(() => {
    let alive = true;
    loadDisclaimer().then((d) => alive && setData(d));
    return () => { alive = false; };
  }, []);
  return data;
}