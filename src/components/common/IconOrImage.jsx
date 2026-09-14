import React from "react";
import {
  Activity, Award, Baby, Banknote, Bone, Brain, Building2, Calendar, Car, Check,
  CheckCircle2, ClipboardCheck, Clock, DollarSign, Droplet, Ear, Eye, FileText,
  Flame, Globe, Headphones, Heart, HeartHandshake, HeartPulse, Home, Hotel,
  Hospital, Landmark, Languages, Leaf, Lightbulb, Lock, MapPin, MessageCircle,
  MessageSquare, MessageSquareHeart, Mic, Mail, Microscope, Phone, PhoneCall,
  Pill, Plane, PlaneTakeoff, Ribbon, Scale, Scissors, Shield, ShieldCheck,
  Smile, Stethoscope, Syringe, Target, Thermometer, Trophy, Truck, UserCheck,
  Users, Video, Wallet, Watch, Wind, Zap,
} from "lucide-react";

// A curated, statically-imported set of icons an admin can reference by
// name in the CMS (e.g. typing "HeartPulse" into a section's icon field).
// This is intentionally NOT `import * as Icons from "lucide-react"` — a
// wildcard import like that pulls the entire ~1600-icon library (750KB+)
// into the bundle because the bundler can't tell ahead of time which icons
// are actually used. Keeping this list curated and explicit means only the
// icons below ever ship to visitors. If an admin types a name that isn't
// here, it falls back to `fallback` — same as any other unrecognized value.
export const ICON_MAP = {
  Activity, Award, Baby, Banknote, Bone, Brain, Building2, Calendar, Car, Check,
  CheckCircle2, ClipboardCheck, Clock, DollarSign, Droplet, Ear, Eye, FileText,
  Flame, Globe, Headphones, Heart, HeartHandshake, HeartPulse, Home, Hotel,
  Hospital, Landmark, Languages, Leaf, Lightbulb, Lock, MapPin, MessageCircle,
  MessageSquare, MessageSquareHeart, Mic, Mail, Microscope, Phone, PhoneCall,
  Pill, Plane, PlaneTakeoff, Ribbon, Scale, Scissors, Shield, ShieldCheck,
  Smile, Stethoscope, Syringe, Target, Thermometer, Trophy, Truck, UserCheck,
  Users, Video, Wallet, Watch, Wind, Zap,
};

const isImageUrl = (value) =>
  typeof value === "string" && (/^https?:\/\//i.test(value.trim()) || value.trim().startsWith("data:"));

/**
 * Renders an icon that may come from three different sources:
 *  - a real lucide-react component reference (hardcoded fallback data uses this)
 *  - a lucide-react icon name string, e.g. "HeartPulse" (admin-typed) — looked
 *    up in the curated ICON_MAP above, not the full library
 *  - an uploaded image URL, e.g. "https://.../uploads/icon.png" (admin-uploaded)
 * Falls back to `fallback` (a component) if `value` is empty or unrecognized.
 */
export default function IconOrImage({ value, fallback: Fallback, className = "w-5 h-5", fill = false, rounded = true, ...rest }) {
  if (isImageUrl(value)) {
    // "fill" mode: image fills its parent container edge-to-edge (e.g. a
    // circular badge) instead of sitting small and centered inside it.
    if (fill) {
      return <img src={value} alt="" className={`w-full h-full object-cover ${rounded ? "rounded-full" : ""}`} />;
    }
    return <img src={value} alt="" className={`${className} object-contain`} />;
  }
  // Hardcoded fallback data passes an actual component reference (a function).
  if (typeof value === "function") {
    const Cmp = value;
    return <Cmp className={className} {...rest} />;
  }
  const Resolved = (typeof value === "string" && value && ICON_MAP[value]) || Fallback;
  if (!Resolved) return null;
  return <Resolved className={className} {...rest} />;
}