// Groups doctors' free-text speciality / designation into a short, clean list
// of departments for the Doctors page filter (e.g. "Senior Director
// Cardiothoracic & Vascular Surgery" → "Cardiology & Cardiac Surgery").
// A doctor can fall in more than one department. Order = dropdown order.
export const DEPARTMENTS = [
  { name: "Oncology (Cancer Care)", re: /oncolog|cancer|tumou?r|radiation|chemo/i },
  { name: "Cardiology & Cardiac Surgery", re: /cardi|heart|ctvs|vascular|electrophysiolog/i },
  { name: "Neurology & Neurosurgery", re: /neuro|brain|stroke|epilep/i },
  { name: "Spine Surgery", re: /spine|spinal/i },
  { name: "Orthopaedics & Joint Replacement", re: /ortho|joint|bone(?! marrow)|knee|hip|arthroplast|sports medicine/i },
  { name: "Kidney Transplant", re: /(kidney|renal)[\s-]*transplant/i },
  { name: "Liver Transplant", re: /liver[\s-]*transplant|ldlt|hepatobiliary|hpb/i },
  { name: "Bone Marrow Transplant & Haematology", re: /bone marrow|\bbmt\b|ha?ematolog|stem cell/i },
  { name: "Nephrology", re: /nephro|dialysis|kidney(?![\s-]*transplant)/i },
  { name: "Urology & Andrology", re: /urolog|androlog|prostate/i },
  { name: "Gastroenterology & Hepatology", re: /gastro|hepatolog|digestive|endoscop|colorectal|\bgi\b/i },
  { name: "Gynaecology & IVF", re: /gyn|obstet|ivf|fertility|reproductive/i },
  { name: "Paediatrics", re: /paediat|pediat|neonat|congenital|child/i },
  { name: "ENT", re: /\bent\b|otolaryng|ear,? nose|head (&|and) neck/i },
  { name: "Ophthalmology (Eye)", re: /ophthalm|\beye\b|retina|cornea|cataract/i },
  { name: "Plastic & Cosmetic Surgery", re: /plastic|cosmetic|aesthetic|reconstructive/i },
  { name: "Bariatric & Laparoscopic Surgery", re: /bariatric|laparoscop|minimal access|general surgery/i },
  { name: "Pulmonology", re: /pulmo|lung|respirat|chest/i },
  { name: "Endocrinology & Diabetes", re: /endocrin|diabet|thyroid/i },
  { name: "Rheumatology", re: /rheumat/i },
  { name: "Dermatology", re: /dermat|skin/i },
  { name: "Dental", re: /dent|maxillofacial|oral/i },
  { name: "Psychiatry", re: /psychiat|mental/i },
  { name: "Internal Medicine", re: /internal medicine|general medicine|physician/i },
];

/** The departments a doctor belongs to; falls back to their speciality text. */
export function doctorDepartments(doc) {
  const text = [doc?.speciality, doc?.badge_title, doc?.designation].filter(Boolean).join(" | ");
  const found = DEPARTMENTS.filter((d) => d.re.test(text)).map((d) => d.name);
  if (found.length > 0) return found;
  const raw = String(doc?.speciality || "").trim();
  return raw ? [raw] : [];
}