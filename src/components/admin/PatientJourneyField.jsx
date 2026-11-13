import React from "react";
import { Plus, X, ChevronUp, ChevronDown, RotateCcw, Route } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_JOURNEY_STEPS, defaultJourneyHeading, parseJourney } from "@/lib/patientJourney";

/**
 * Admin editor for the "International Patient Journey" section of a doctor
 * or treatment: the heading line plus numbered steps (title + description).
 * Left empty, the public page shows the default steps.
 *
 * kind: "doctor" | "treatment"; name: the record's name (for the default heading)
 * steps: saved value (JSON text or array); heading: string
 */
export default function PatientJourneyField({ kind, name, steps, heading, onStepsChange, onHeadingChange }) {
  // Keep blank rows while typing (parseJourney would drop them).
  const raw = typeof steps === "string" ? parseJourney(steps) : Array.isArray(steps) ? steps : [];
  const list = raw.map((s) => ({ title: s?.title || "", description: s?.description || "" }));
  const usingDefault = parseJourney(list).length === 0;

  const update = (i, key, val) => onStepsChange(list.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));
  const remove = (i) => onStepsChange(list.filter((_, idx) => idx !== i));
  const add = () => onStepsChange([...list, { title: "", description: "" }]);
  const move = (from, to) => {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onStepsChange(next);
  };
  const loadDefaults = () => onStepsChange(DEFAULT_JOURNEY_STEPS.map((s) => ({ ...s })));

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Route className="w-4 h-4 text-primary" /> International Patient Journey
        </h3>
        <button type="button" onClick={loadDefaults} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground shrink-0">
          <RotateCcw className="w-3 h-3" /> Default steps load karein
        </button>
      </div>
      <p className="text-xs text-muted-foreground/80 mb-4">
        "Additional Information" ke neeche dikhta hai.{" "}
        {usingDefault
          ? `Abhi koi step nahi bhara hai, isliye website par ${DEFAULT_JOURNEY_STEPS.length} default steps dikh rahe hain. Badalne ke liye "Default steps load karein" dabayein ya naya step jodein.`
          : "Yahan bhare hue steps website par dikhenge. Sab hata denge to default steps wapas aa jayenge."}{" "}
        Section chhupana ho to "Section Order & Titles" me aankh wala button dabayein.
      </p>

      <label className="block text-xs font-semibold text-foreground/80 mb-1">Heading (card ke upar)</label>
      <Input
        value={heading || ""}
        onChange={(e) => onHeadingChange(e.target.value)}
        placeholder={defaultJourneyHeading(kind, name)}
        className="h-10 rounded-lg border-border mb-4"
      />

      <div className="space-y-3">
        {list.map((step, i) => (
          <div key={i} className="rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{i + 1}</span>
              <Input
                value={step.title}
                onChange={(e) => update(i, "title", e.target.value)}
                placeholder="Step title, e.g. Submit an Enquiry"
                className="h-9 rounded-lg border-border bg-white"
              />
              <div className="flex shrink-0">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Upar">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Neeche">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(i)} className="p-1.5 text-muted-foreground hover:text-destructive" title="Hatayein">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <Textarea
              value={step.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="Step ki details"
              rows={2}
              className="rounded-lg border-border bg-white text-sm"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5"
      >
        <Plus className="w-4 h-4" /> Step jodein
      </button>
    </div>
  );
}