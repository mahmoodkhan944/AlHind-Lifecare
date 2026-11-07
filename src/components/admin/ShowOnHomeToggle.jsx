import React from "react";
import { Home } from "lucide-react";
import { Switch } from "@/components/ui/switch";

/**
 * "Show on Homepage" switch used in the Treatment, Hospital, Doctor, Package
 * and Blog forms. When at least one record in a section has it on, the
 * homepage section shows only those; when none do, the section falls back to
 * the newest records (so it never goes empty).
 */
export default function ShowOnHomeToggle({ checked, onChange, section }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-accent-jade/25 bg-accent-jade/5 px-3.5 py-3 cursor-pointer">
      <Switch checked={!!checked} onCheckedChange={onChange} className="mt-0.5" />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Home className="w-4 h-4 text-accent-jade" /> Show on Homepage
        </span>
        <span className="block text-xs text-muted-foreground mt-0.5">
          Shows this in the homepage “{section}” section.
        </span>
      </span>
    </label>
  );
}