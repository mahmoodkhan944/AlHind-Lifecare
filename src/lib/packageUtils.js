// Shared helpers for treatment packages (public pages + admin).

export const PACKAGE_COUNTRIES = ["India", "Turkey", "UAE"];

export const COUNTRY_CODES = { India: "IN", Turkey: "TR", UAE: "AE" };

export const parseList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const p = JSON.parse(val);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

export const toNumber = (val) => {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};

export function formatPrice(amount, currency = "USD") {
  const n = toNumber(amount);
  if (n === null) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString("en-US")}`;
  }
}

/** Whole-number discount %, or 0 when there's no valid original price. */
export function discountPercent(pkg) {
  const price = toNumber(pkg?.price);
  const original = toNumber(pkg?.original_price);
  if (!price || !original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

/** Deposit to book, e.g. 10% of the price. 0 when booking % is not set. */
export function bookingAmount(pkg) {
  const price = toNumber(pkg?.price);
  const pct = toNumber(pkg?.booking_percent);
  if (!price || !pct) return 0;
  return Math.round((price * pct) / 100);
}

export const packagePath = (pkg) => `/packages/${pkg.slug || pkg.id}`;

export const pluralize = (n, word) => `${n} ${word}${Number(n) === 1 ? "" : "s"}`;

// ---------------------------------------------------------------------------
// Package Details (accordion), Treatment Info and page section order
// ---------------------------------------------------------------------------

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Sections of the package page, in default order. `key` is fixed, `title` is editable in admin. */
export const DEFAULT_PACKAGE_SECTIONS = [
  { key: "highlights", title: "Package Highlights" },
  { key: "package_details", title: "Package Details" },
  { key: "itinerary", title: "Day-by-Day Plan" },
  { key: "hospital", title: "Your Hospital" },
  { key: "doctor", title: "Your Doctor" },
  { key: "treatment_info", title: "Treatment Related Information" },
  { key: "faqs", title: "Frequently Asked Questions" },
];

/** Admin's saved order, plus any section added later in code, minus unknown keys. */
export function resolvePackageSections(raw) {
  const saved = parseList(raw).filter((s) => s && DEFAULT_PACKAGE_SECTIONS.some((d) => d.key === s.key));
  if (saved.length === 0) return DEFAULT_PACKAGE_SECTIONS.map((s) => ({ ...s, visible: true }));
  const missing = DEFAULT_PACKAGE_SECTIONS.filter((d) => !saved.some((s) => s.key === d.key)).map((s) => ({ ...s, visible: true }));
  return [...saved.map((s) => ({ ...s, title: s.title || DEFAULT_PACKAGE_SECTIONS.find((d) => d.key === s.key).title })), ...missing];
}

const block = (o = {}) => ({ id: uid(), subheading: "", text: "", points: [], ...o });

/** Starting accordion items for a new package. Empty items are not shown on the site. */
export const defaultPackageDetails = (inclusions = []) => [
  { id: uid(), title: "Package Description", blocks: [block()] },
  { id: uid(), title: "Cost Details", blocks: [block()] },
  { id: uid(), title: "Inclusions", blocks: [block({ points: inclusions })] },
  { id: uid(), title: "Exclusions", blocks: [block()] },
  { id: uid(), title: "Extra Options", blocks: [block()] },
];

/** Normalises saved details, giving every item/block an id (needed for drag & drop). */
export function normalizeDetails(list) {
  return (Array.isArray(list) ? list : [])
    .filter((it) => it && typeof it === "object")
    .map((it) => ({
      id: it.id || uid(),
      title: it.title || "",
      blocks: (Array.isArray(it.blocks) && it.blocks.length ? it.blocks : [{}]).map((b) => ({
        id: b?.id || uid(),
        subheading: b?.subheading || "",
        text: b?.text || "",
        points: Array.isArray(b?.points) ? b.points : [],
      })),
    }));
}

/**
 * The package's accordion items. Packages saved before this feature existed
 * have no package_details yet, so build them from the old Overview /
 * Included / Not Included fields.
 */
export function resolvePackageDetails(pkg) {
  const saved = normalizeDetails(parseList(pkg?.package_details));
  if (saved.length > 0) return saved;
  const legacy = [];
  if (pkg?.description) legacy.push({ id: uid(), title: "Package Description", blocks: [block({ text: pkg.description })] });
  const inc = parseList(pkg?.inclusions);
  if (inc.length) legacy.push({ id: uid(), title: "Inclusions", blocks: [block({ points: inc })] });
  const exc = parseList(pkg?.exclusions);
  if (exc.length) legacy.push({ id: uid(), title: "Exclusions", blocks: [block({ points: exc })] });
  return legacy;
}

/** True when an accordion item has anything to show. */
export const detailHasContent = (item) =>
  (item.blocks || []).some((b) => b.subheading?.trim() || b.text?.trim() || (b.points || []).some((p) => String(p).trim()));

/** Drops empty bullets/blocks/items before saving. */
export function cleanDetails(list) {
  return normalizeDetails(list)
    .map((it) => ({
      ...it,
      title: it.title.trim(),
      blocks: it.blocks
        .map((b) => ({ ...b, subheading: b.subheading.trim(), text: b.text.trim(), points: b.points.map((p) => String(p).trim()).filter(Boolean) }))
        .filter((b) => b.subheading || b.text || b.points.length),
    }))
    .filter((it) => it.title && it.blocks.length);
}