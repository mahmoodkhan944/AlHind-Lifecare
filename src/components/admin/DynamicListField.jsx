import React from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DynamicListField({
  label,
  placeholder,
  number,
  required,
  optional,
  values = [],
  onChange,
  buttonAtTop = false,
  darkButton = false,
  addLabel,
  accent = false,
}) {
  const items = Array.isArray(values) ? values : [];

  const addItem = () => onChange([...items, ""]);
  const updateItem = (idx, val) => onChange(items.map((item, i) => (i === idx ? val : item)));
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));

  const addBtnClass = darkButton
    ? "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-medium hover:bg-secondary/90 transition-colors"
    : "flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white text-foreground/80 text-xs font-medium hover:bg-muted transition-colors";

  const Header = (
    <div className={`flex items-center gap-2 ${buttonAtTop ? "justify-between mb-3" : "mb-3"}`}>
      <div className="flex items-center gap-2">
        {number != null && (
          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${accent ? "bg-[hsl(var(--accent-warm)/0.15)] text-[hsl(var(--accent-warm))]" : "bg-accent-jade/15 text-accent-jade"}`}>
            {number}
          </span>
        )}
        <h3 className="font-bold text-foreground text-sm">
          {label}
          {required && <span className="text-destructive"> *</span>}
          {optional && <span className="text-muted-foreground/70 font-normal text-xs ml-1">(optional)</span>}
        </h3>
      </div>
      {buttonAtTop && (
        <button type="button" onClick={addItem} className={addBtnClass}>
          <Plus className="w-3.5 h-3.5" /> {addLabel || "Add"}
        </button>
      )}
    </div>
  );

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${accent ? "bg-[hsl(var(--accent-warm)/0.08)] border-amber-200" : "bg-white border-border"}`}>
      {Header}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={`${placeholder} ${idx + 1}`}
              className="flex-1 h-10 rounded-lg border-border bg-white"
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {!buttonAtTop && (
        <button
          type="button"
          onClick={addItem}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
        >
          <Plus className="w-4 h-4" />
          + Add {label}
        </button>
      )}
      {buttonAtTop && items.length === 0 && (
        <p className="text-xs text-muted-foreground/70 text-center py-2">No items added yet. Click "+ Add" above.</p>
      )}
    </div>
  );
}