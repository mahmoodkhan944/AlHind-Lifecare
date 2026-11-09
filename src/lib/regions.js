// Regions used to group hospitals on the homepage
// ("Global Healthcare Destinations" → one card per region).
//
// A hospital's region comes from Admin → Hospitals → "Region". If that is
// empty, it is worked out from the city (e.g. Faridabad → Delhi NCR), and
// otherwise the city itself is used.

export const INDIA_REGIONS = [
  { name: "Delhi NCR", cities: ["delhi", "new delhi", "gurugram", "gurgaon", "noida", "greater noida", "faridabad", "ghaziabad", "sonipat"] },
  { name: "Mumbai", cities: ["mumbai", "navi mumbai", "thane"] },
  { name: "Bengaluru", cities: ["bengaluru", "bangalore"] },
  { name: "Chennai", cities: ["chennai"] },
  { name: "Hyderabad", cities: ["hyderabad", "secunderabad"] },
  { name: "Kolkata", cities: ["kolkata", "calcutta"] },
  { name: "Pune", cities: ["pune"] },
  { name: "Ahmedabad", cities: ["ahmedabad", "gandhinagar"] },
  { name: "Kochi", cities: ["kochi", "cochin"] },
  { name: "Jaipur", cities: ["jaipur"] },
  { name: "Lucknow", cities: ["lucknow"] },
  { name: "Chandigarh", cities: ["chandigarh", "mohali", "panchkula"] },
];

export const REGION_NAMES = INDIA_REGIONS.map((r) => r.name);

const norm = (v) => String(v || "").trim().toLowerCase();

export function hospitalRegion(h) {
  const own = String(h?.region || "").trim();
  if (own) {
    // Use the preset's spelling when it matches (e.g. "delhi ncr" → "Delhi NCR").
    return INDIA_REGIONS.find((r) => norm(r.name) === norm(own))?.name || own;
  }
  const city = norm(h?.city);
  const preset = INDIA_REGIONS.find((r) => r.cities.includes(city));
  if (preset) return preset.name;
  return String(h?.city || "").trim() || "Other";
}

export const sameRegion = (a, b) => norm(a) === norm(b);