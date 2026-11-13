// Merges a record's saved section order (admin "Section Order & Titles") with
// the built-in defaults. A default section the saved list doesn't know yet
// (one added after the record was last saved) is slotted in right after the
// section that comes before it in the defaults — e.g. a new section placed
// after "Additional Information" shows up there, not at the very end.
export function mergeSectionConfig(saved, defaults) {
  const list = Array.isArray(saved) ? saved.filter((s) => s && s.key) : [];
  if (list.length === 0) return defaults.map((s) => ({ ...s, visible: true }));
  const out = [...list];
  defaults.forEach((def, i) => {
    if (out.some((s) => s.key === def.key)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const idx = out.findIndex((s) => s.key === defaults[j].key);
      if (idx !== -1) { at = idx + 1; break; }
    }
    out.splice(at, 0, { ...def, visible: true });
  });
  return out;
}