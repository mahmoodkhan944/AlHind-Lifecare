import React from "react";
import * as Icons from "lucide-react";

const isImageUrl = (value) =>
  typeof value === "string" && (/^https?:\/\//i.test(value.trim()) || value.trim().startsWith("data:"));

/**
 * Renders an icon that may come from three different sources:
 *  - a real lucide-react component reference (hardcoded fallback data uses this)
 *  - a lucide-react icon name string, e.g. "HeartPulse" (admin-typed)
 *  - an uploaded image URL, e.g. "https://.../uploads/icon.png" (admin-uploaded)
 * Falls back to `fallback` (a component) if `value` is empty or unrecognized.
 */
export default function IconOrImage({ value, fallback: Fallback, className = "w-5 h-5", fill = false, ...rest }) {
  if (isImageUrl(value)) {
    // "fill" mode: image fills its parent container edge-to-edge (e.g. a
    // circular badge) instead of sitting small and centered inside it.
    if (fill) {
      return <img src={value} alt="" className="w-full h-full object-cover rounded-full" />;
    }
    return <img src={value} alt="" className={`${className} object-contain`} />;
  }
  // Hardcoded fallback data passes an actual component reference (a function).
  if (typeof value === "function") {
    const Cmp = value;
    return <Cmp className={className} {...rest} />;
  }
  const Resolved = (typeof value === "string" && value && Icons[value]) || Fallback;
  if (!Resolved) return null;
  return <Resolved className={className} {...rest} />;
}