import React, { useState } from "react";
import { Check, Plus, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DEPARTMENTS, autoDepartments, parseDepartments } from "@/lib/departments";

/**
 * Admin: pick the doctor's department(s) for the Doctors page filter.
 * Tap chips to select (more than one allowed), or type a new department.
 * Left empty, the department is worked out from speciality / designation —
 * that guess is shown so the admin can see what will be used.
 *
 * extraOptions: departments other doctors already use (custom ones included)
 */
export default function DepartmentField({ value, onChange, doctor, extraOptions = [] }) {
  const selected = parseDepartments(value);
  const [custom, setCustom] = useState("");
  const isOn = (name) => selected.some((s) => s.toLowerCase() === name.toLowerCase());

  const known = DEPARTMENTS.map((d) => d.name);
  const options = [
    ...known,
    ...[...extraOptions, ...selected]
      .filter((n) => n && !known.some((k) => k.toLowerCase() === n.toLowerCase()))
      .filter((n, i, arr) => arr.findIndex((x) => x.toLowerCase() === n.toLowerCase()) === i)
      .sort((a, b) => a.localeCompare(b)),
  ];

  const toggle = (name) =>
    onChange(isOn(name) ? selected.filter((s) => s.toLowerCase() !== name.toLowerCase()) : [...selected, name]);

  const addCustom = () => {
    const name = custom.trim();
    if (!name) return;
    if (!isOn(name)) onChange([...selected, name]);
    setCustom("");
  };

  const auto = autoDepartments(doctor || {});

  return (
    <div>
      {selected.length === 0 ? (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            Koi department nahi chuna, isliye apne aap:{" "}
            {auto.length > 0 ? <b className="text-secondary">{auto.join(", ")}</b> : <i>speciality bharne par dikhega</i>}
          </span>
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {selected.map((name) => (
            <span key={name} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {name}
              <button type="button" onClick={() => toggle(name)} className="p-0.5 rounded-full hover:bg-white/20" title="Hatayein">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-2 rounded-lg border border-border bg-muted/30">
        {options.map((name) => {
          const on = isOn(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                on
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-white border-border text-foreground/80 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {on && <Check className="w-3 h-3" />}
              {name}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mt-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="List me nahi hai? Naya department likhein"
          className="h-9 rounded-lg border-border text-sm"
        />
        <button
          type="button"
          onClick={addCustom}
          className="shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-secondary/90"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}