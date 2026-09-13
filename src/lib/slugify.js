// Turns a name into a URL-friendly slug, e.g. "ASD vs VSD Closure" ->
// "asd-vs-vsd-closure". Used both for generating a treatment's slug when one
// isn't set, and for building links to a treatment's detail page.
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The public URL for a treatment. Prefers the stored slug (SEO-friendly,
// e.g. /treatments/knee-replacement-in-india); falls back to a slug derived
// from the name for older records that don't have one saved yet, and finally
// to the raw id so nothing ever links to a broken page.
export function treatmentUrl(t) {
  if (!t) return "/treatments";
  const slug = t.slug || slugify(t.name);
  return `/treatments/${slug || t.id}`;
}