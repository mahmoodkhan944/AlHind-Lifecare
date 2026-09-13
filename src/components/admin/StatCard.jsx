import React from "react";

const COLOR_STYLES = {
  blue: { bg: "bg-blue-50", label: "text-blue-700", value: "text-blue-900", icon: "text-blue-500" },
  green: { bg: "bg-emerald-50", label: "text-emerald-700", value: "text-emerald-900", icon: "text-emerald-500" },
  purple: { bg: "bg-violet-50", label: "text-violet-700", value: "text-violet-900", icon: "text-violet-500" },
  amber: { bg: "bg-amber-50", label: "text-amber-700", value: "text-amber-900", icon: "text-amber-500" },
  red: { bg: "bg-rose-50", label: "text-rose-700", value: "text-rose-900", icon: "text-rose-500" },
  neutral: { bg: "bg-muted", label: "text-muted-foreground", value: "text-foreground", icon: "text-muted-foreground" },
};

export default function StatCard({ label, value, color = "neutral", icon: Icon, dot = false }) {
  const c = COLOR_STYLES[color] || COLOR_STYLES.neutral;
  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${c.bg}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm font-medium ${c.label}`}>{label}</p>
        {Icon && <Icon className={`w-5 h-5 ${c.icon}`} />}
        {dot && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
      </div>
      <p className={`font-heading font-bold text-2xl sm:text-3xl mt-1 ${c.value}`}>{value}</p>
    </div>
  );
}