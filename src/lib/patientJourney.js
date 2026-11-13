// "International Patient Journey" — the numbered steps shown under
// "Additional Information" on doctor and treatment pages.
//
// Stored per record in two columns (migration 012):
//   patient_journey          JSON text: [{ title, description }]
//   patient_journey_heading  text: the line above the steps card
// When a record has no steps of its own, DEFAULT_JOURNEY_STEPS are shown.

export const JOURNEY_SECTION_KEY = "patient_journey";
export const JOURNEY_SECTION_TITLE = "International Patient Journey";
export const BRAND_NAME = "AlHind Lifecare";

export const DEFAULT_JOURNEY_STEPS = [
  {
    title: "Submit an Enquiry",
    description: `International patients contact ${BRAND_NAME} through the website, WhatsApp or email and share their medical requirements.`,
  },
  {
    title: "Share Medical Reports",
    description: "Patients share their latest medical reports, scans (CT / MRI / PET-CT), blood investigations, previous prescriptions and treatment history.",
  },
  {
    title: "Medical Evaluation",
    description: `${BRAND_NAME} coordinates the submission of records to the hospital or doctor for review. Additional tests or information may be requested.`,
  },
  {
    title: "Online Consultation",
    description: "A teleconsultation can be requested, subject to the doctor's availability and hospital procedures.",
  },
  {
    title: "Treatment Plan & Cost Estimate",
    description: "The hospital provides a proposed treatment plan and estimated expenses following medical assessment.",
  },
  {
    title: "Medical Visa Assistance",
    description: `${BRAND_NAME} assists with coordinating the required hospital invitation documents where approved. The final visa decision rests with the relevant embassy or authorities.`,
  },
  {
    title: "Travel & Arrival Support",
    description: "Airport pickup, accommodation near the hospital and interpreter support can be arranged on request.",
  },
  {
    title: "Treatment & Follow-up",
    description: "Post-treatment follow-up and communication with the treating hospital can be coordinated after patients return to their home countries.",
  },
];

export const defaultJourneyHeading = (kind, name) =>
  kind === "doctor"
    ? `How International Patients Can Reach ${name || "This Doctor"} Through ${BRAND_NAME}`
    : `How International Patients Can Get ${name || "This Treatment"} in India Through ${BRAND_NAME}`;

/** Saved steps (JSON text or array) → [{ title, description }], blanks dropped. */
export function parseJourney(raw) {
  let list = raw;
  if (typeof raw === "string") {
    try { list = JSON.parse(raw); } catch { list = []; }
  }
  if (!Array.isArray(list)) return [];
  return list
    .filter((s) => s && typeof s === "object")
    .map((s) => ({ title: String(s.title || "").trim(), description: String(s.description || "").trim() }))
    .filter((s) => s.title || s.description);
}

/** What the public page shows: the record's own steps, else the defaults. */
export function journeyFor(record, kind) {
  const own = parseJourney(record?.patient_journey);
  return {
    heading: String(record?.patient_journey_heading || "").trim() || defaultJourneyHeading(kind, record?.name),
    steps: own.length > 0 ? own : DEFAULT_JOURNEY_STEPS,
  };
}

/** Adds the two journey columns to a save payload — only when the form has
 *  them (typed in, or loaded from a row that has the columns), so saving
 *  still works before migration 012 is run. */
export function applyJourneyToPayload(data, form) {
  if ("patient_journey" in form) {
    const steps = parseJourney(form.patient_journey);
    data.patient_journey = steps.length > 0 ? JSON.stringify(steps) : null;
  }
  if ("patient_journey_heading" in form) {
    data.patient_journey_heading = String(form.patient_journey_heading || "").trim() || null;
  }
  return data;
}

export const isMissingJourneyColumn = (err) => /patient_journey/.test(err?.message || "");
export const JOURNEY_MIGRATION_HINT =
  "Patient Journey ke columns abhi database me nahi hain. Supabase SQL Editor me supabase/migrations/012_patient_journey.sql run karein.";