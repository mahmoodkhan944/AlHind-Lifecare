// Shared ordering rules for lists in the admin panel and on the website:
//   • newest first — anything just created shows at the top;
//   • in the admin panel, inactive (hidden) records drop to the very bottom.

// Statuses that mean "not shown on the website".
const HIDDEN_STATUSES = new Set(["inactive", "rejected", "cancelled"]);

const createdTime = (r) => new Date(r?.created_date || 0).getTime() || 0;

/** Newest created first. */
export const newestFirst = (rows) => [...(rows || [])].sort((a, b) => createdTime(b) - createdTime(a));

/** Active records newest first, then inactive ones (also newest first) at the bottom. */
export const activeFirst = (rows) =>
  [...(rows || [])].sort(
    (a, b) =>
      Number(HIDDEN_STATUSES.has(a?.status)) - Number(HIDDEN_STATUSES.has(b?.status)) || createdTime(b) - createdTime(a)
  );