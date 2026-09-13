import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

/**
 * A search box + scrollable checkbox list, for picking a set of related
 * records (e.g. which Hospitals offer a Treatment) from admin forms.
 *
 * Props:
 *  - label: section heading, e.g. "Hospitals"
 *  - optional: shows "(optional)" next to the label
 *  - items: full list of { id, name, subtitle? } options to search/pick from
 *  - selectedIds: array of currently-selected ids
 *  - onChange: (nextSelectedIds) => void
 *  - searchPlaceholder: placeholder text for the search box
 *  - emptyText: shown when there are no items to pick from at all
 */
export default function SearchableCheckboxList({
  label,
  optional,
  items,
  selectedIds,
  onChange,
  searchPlaceholder = "Search...",
  emptyText = "Nothing to pick from yet.",
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const toggle = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground text-sm">
          {label} {optional && <span className="text-muted-foreground/70 font-normal text-xs">(optional)</span>}
        </h3>
        {selectedIds.length > 0 && (
          <span className="text-xs font-medium text-accent-jade">{selectedIds.length} selected</span>
        )}
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 h-10 rounded-lg border-border"
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground/70 text-center py-6">{emptyText}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground/70 text-center py-6">No matches for "{search}"</p>
        ) : (
          filtered.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggle(item.id)}
                className="w-4 h-4 rounded border-border text-accent-jade focus:ring-accent-jade shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                {item.subtitle && <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>}
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}