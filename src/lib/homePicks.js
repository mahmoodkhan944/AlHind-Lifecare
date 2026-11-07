// Homepage sections show the records the admin switched "Show on Homepage" on.
// If none are switched on (or the show_on_home column hasn't been added to the
// database yet), the section falls back to its previous behaviour so the
// homepage never goes empty.
export async function homePicks(entity, filter, sort, limit, fallback) {
  try {
    const picked = await entity.filter({ ...filter, show_on_home: true }, sort, limit);
    if (picked.length > 0) return picked;
  } catch {
    // column missing → use the fallback below
  }
  return fallback();
}