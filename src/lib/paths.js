// Public URLs. Doctors use their SEO-friendly URL slug when they have one
// (e.g. /doctors/dr-vikram-dua-neurosurgeon-faridabad); old /doctors/<id>
// links keep working because the doctor page accepts either.
export const doctorPath = (doc) => `/doctors/${doc?.slug || doc?.id}`;

export const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");