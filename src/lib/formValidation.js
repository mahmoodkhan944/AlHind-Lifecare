import { COUNTRIES } from "@/lib/countries";

/**
 * Finds a country from the COUNTRIES list by name (case-insensitive).
 * Returns undefined for "Select Country", empty or unknown names.
 */
function findCountry(name) {
  const n = (name || "").trim().toLowerCase();
  if (!n) return undefined;
  return COUNTRIES.find((c) => c.code && c.name.toLowerCase() === n);
}

/**
 * Validates a phone number for the selected country.
 *
 * - `phone`: what the user typed (usually the local number, e.g. "98765 43210";
 *   a full international number like "+44 7911 123456" also works)
 * - `countryName`: the selected country name, e.g. "India". If nothing is
 *   selected we assume India, the same fallback getDialCode() uses for the
 *   dial-code box shown next to the phone field.
 *
 * Returns { valid: true, formatted } — formatted is the clean international
 * number to save, e.g. "+91 98765 43210" — or { valid: false, error }.
 *
 * libphonenumber-js is loaded only when a form is submitted, so it doesn't
 * add weight to the initial page load.
 */
export async function validatePhone(phone, countryName) {
  const raw = (phone || "").trim();

  if (!raw) {
    return { valid: false, error: "Please enter your phone number." };
  }
  if (!/^[0-9+()\-\s.]+$/.test(raw)) {
    return { valid: false, error: "Phone number can contain digits only." };
  }

  const country = findCountry(countryName);
  const iso = country?.code || "IN";

  const { parsePhoneNumberFromString } = await import("libphonenumber-js/min");
  const parsed = parsePhoneNumberFromString(raw, iso);

  if (!parsed || !parsed.isValid()) {
    if (iso === "IN" && !raw.startsWith("+")) {
      return { valid: false, error: "Please enter a valid 10-digit Indian mobile number." };
    }
    const where = country?.name ? ` for ${country.name}` : "";
    return { valid: false, error: `Please enter a valid phone number${where}.` };
  }

  return { valid: true, formatted: parsed.formatInternational() };
}

/**
 * Turns an error from db.entities.*.create() into a message safe to show
 * visitors. Our database triggers raise readable messages (codes starting
 * with "P0", e.g. rate limit or validation); anything else gets a generic text.
 */
export function friendlyError(err) {
  const code = String(err?.status || "");
  if (code.startsWith("P0") && err?.message) return err.message;
  return "Something went wrong. Please try again.";
}