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