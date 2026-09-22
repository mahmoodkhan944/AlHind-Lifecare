import React, { useState } from "react";
import { GripVertical, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * A draggable, renameable, show/hide-able list of section rows, used in
 * admin forms to control the ORDER and TITLES of sections shown on a
 * treatment/hospital/doctor's public detail page.
 *
 * Props:
 *  - label: card heading, e.g. "Section Order & Titles"
 *  - defaultSections: [{ key, title }] — the built-in default order/titles
 *  - value: the admin's current config, [{ key, title, visible }] in order,
 *      or empty/undefined to mean "use defaults"
 *  - onChange: (nextConfig) => void
 *
 * A section only actually appears on the live page if it (a) is marked
 * visible here AND (b) has real content filled in elsewhere in the form —
 * this editor controls order/title/visibility, not content.
 */
export default function SectionOrderEditor({ label = "Section Order & Titles", defaultSections, value, onChange }) {
  const [dragIndex, setDragIndex] = useState(null);

  const list =
    value && value.length > 0
      ? value
      : defaultSections.map((s) => ({ key: s.key, title: s.title, visible: true }));

  const move = (from, to) => {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const setTitle = (idx, title) => {
    onChange(list.map((s, i) => (i === idx ? { ...s, title } : s)));
  };

  const toggleVisible = (idx) => {
    onChange(list.map((s, i) => (i === idx ? { ...s, visible: s.visible === false } : s)));
  };

  const resetToDefaults = () => {
    onChange(defaultSections.map((s) => ({ key: s.key, title: s.title, visible: true })));
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-foreground text-sm">{label}</h3>
        <button
          type="button"
          onClick={resetToDefaults}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3 h-3" /> Reset order
        </button>
      </div>
      <p className="text-xs text-muted-foreground/70 mb-3">
        Drag to reorder, rename a section's heading, or hide it. A section only shows on the page if it's visible
        here AND has content filled in below — this only controls order, title, and visibility.
      </p>

      <div className="space-y-1.5">
        {list.map((s, idx) => (
          <div
            key={s.key}
            draggable
            onDragStart={() => setDragIndex(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== idx) move(dragIndex, idx);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`flex items-center gap-2 border border-border rounded-lg px-2 py-1.5 bg-white transition-opacity ${
              s.visible === false ? "opacity-50" : ""
            } ${dragIndex === idx ? "opacity-30" : ""}`}
          >
            <span className="cursor-grab active:cursor-grabbing text-muted-foreground/60 shrink-0">
              <GripVertical className="w-4 h-4" />
            </span>
            <Input
              value={s.title}
              onChange={(e) => setTitle(idx, e.target.value)}
              className="h-8 rounded-md border-border text-sm flex-1 min-w-0"
            />
            <button
              type="button"
              onClick={() => toggleVisible(idx)}
              className="shrink-0 text-muted-foreground hover:text-foreground p-1"
              title={s.visible === false ? "Hidden — click to show" : "Visible — click to hide"}
            >
              {s.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <div className="flex flex-col shrink-0">
              <button
                type="button"
                onClick={() => move(idx, idx - 1)}
                disabled={idx === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-20 leading-none"
                aria-label="Move up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(idx, idx + 1)}
                disabled={idx === list.length - 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-20 leading-none"
                aria-label="Move down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}