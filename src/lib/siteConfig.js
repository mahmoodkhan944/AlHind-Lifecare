// Site-wide switches.
//
// SHOW_TURKEY — set to `true` to bring Turkey back on the public website.
// While it is `false`, Turkey hospitals, doctors, treatments and packages are
// hidden from visitors (lists, homepage, detail pages, filters). Nothing is
// deleted: the Admin panel still shows and edits every record.
export const SHOW_TURKEY = false;

export const HIDDEN_COUNTRIES = SHOW_TURKEY ? [] : ["Turkey"];

export const isHiddenCountry = (country) =>
  HIDDEN_COUNTRIES.some((h) => String(country || "").trim().toLowerCase() === h.toLowerCase());

// The Admin panel always sees everything.
export const isAdminArea = () =>
  typeof window !== "undefined" && /\/admin(\/|$)/.test(window.location.pathname);

export const hideCountriesNow = () => HIDDEN_COUNTRIES.length > 0 && !isAdminArea();

// "India and Turkey" in default page text, or just "India" while Turkey is off.
export const DESTINATIONS_TEXT = SHOW_TURKEY ? "India and Turkey" : "India";