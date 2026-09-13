import React, { useState, useRef, useEffect } from "react";

/**
 * A plain text input with a suggestions dropdown underneath — type to filter
 * `options`, click one to fill it in, or just keep typing/leave your own
 * text if what you want isn't in the list. Unlike a <Select>, the value is
 * never restricted to the option list.
 *
 * Props:
 *  - value / onChange: the underlying text value, same as a normal input
 *  - options: array of strings to suggest
 *  - placeholder
 */
export default function AutocompleteInput({ value, onChange, options, placeholder, className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const query = (value || "").toLowerCase().trim();
  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query) && o.toLowerCase() !== query)
    : options;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}`}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-border bg-white shadow-lg">
          {filtered.slice(0, 50).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted truncate"
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {open && query && filtered.length === 0 && !options.some((o) => o.toLowerCase() === query) && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-white shadow-lg px-3 py-2 text-xs text-muted-foreground">
          No match — "{value}" will be added as a new entry.
        </div>
      )}
    </div>
  );
}