// Multiple sub-headings per section (Hospital / Doctor / Treatment pages).
//
// Each list section (e.g. "specialities", "risks") can hold several groups:
//   [{ id, subheading, items: ["...", "..."] }]
// stored together in the record's `section_groups` column as
//   { [sectionKey]: groups[] }.
//
// For compatibility the old columns are still written on save: the section's
// own column gets ALL items (flattened), and section_subheadings[key] gets
// the first group's sub-heading — so search, filters, "related hospitals"
// matching etc. keep working, and records saved before this feature (which
// have no section_groups yet) still display as one group.

export const uid = () => Math.random().toString(36).slice(2, 10);

const parseJson = (val, fallback) => {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

const parseList = (val) => {
  const v = parseJson(val, []);
  return Array.isArray(v) ? v : [];
};

const parseObj = (val) => {
  const v = parseJson(val, {});
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
};

export const newGroup = (o = {}) => ({ id: uid(), subheading: "", items: [""], ...o });

const normalize = (groups) =>
  (Array.isArray(groups) ? groups : [])
    .filter((g) => g && typeof g === "object")
    .map((g) => ({
      id: g.id || uid(),
      subheading: String(g.subheading || ""),
      items: (Array.isArray(g.items) ? g.items : []).map((i) => String(i ?? "")),
    }));

/**
 * The groups for one section of a saved record. Falls back to the old single
 * list + single sub-heading when the record has no groups for that section.
 */
export function getGroups(record, key) {
  const map = parseObj(record?.section_groups);
  const saved = normalize(map[key]);
  if (saved.length > 0) return saved;
  const items = parseList(record?.[key]).map((i) => String(i ?? ""));
  const subheading = String(parseObj(record?.section_subheadings)[key] || "");
  if (items.length === 0 && !subheading) return [];
  return [{ id: uid(), subheading, items }];
}

/** Groups with blank items removed, and empty groups dropped — for display. */
export function visibleGroups(record, key) {
  return getGroups(record, key)
    .map((g) => ({ ...g, subheading: g.subheading.trim(), items: g.items.map((i) => i.trim()).filter(Boolean) }))
    .filter((g) => g.subheading || g.items.length > 0);
}

/** Total number of (non-empty) items in a section, across all its groups. */
export const groupItemCount = (groups) => groups.reduce((n, g) => n + g.items.length, 0);

/** Builds the form's editable map { key: groups[] } from a saved record. */
export function buildGroupsMap(record, keys) {
  return Object.fromEntries(keys.map((k) => [k, record ? getGroups(record, k) : []]));
}

/**
 * Writes the edited groups into the save payload: section_groups (JSON), the
 * flattened legacy column for each key, and the first sub-heading into
 * section_subheadings. `data` is mutated and returned.
 */
export function applyGroupsToPayload(data, groupsMap, keys) {
  const subs = { ...parseObj(data.section_subheadings) };
  const cleanMap = {};
  keys.forEach((key) => {
    const groups = normalize(groupsMap?.[key])
      .map((g) => ({ ...g, subheading: g.subheading.trim(), items: g.items.map((i) => i.trim()).filter(Boolean) }))
      .filter((g) => g.subheading || g.items.length > 0);
    cleanMap[key] = groups;
    data[key] = JSON.stringify(groups.flatMap((g) => g.items));
    subs[key] = groups[0]?.subheading || "";
  });
  data.section_subheadings = JSON.stringify(subs);
  data.section_groups = JSON.stringify(cleanMap);
  return data;
}