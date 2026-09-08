import React from "react";
import SiteContentManager from "@/pages/admin/SiteContentManager";

// Homepage content blocks. About page content now lives in its own admin
// tab — see AdminAboutContent.jsx — so this list stays short and focused.
const SECTIONS = [
  { key: "specialties", label: "Multi-Specialty Focus", hasDescription: false, hasLink: true },
  { key: "services", label: "Our Services", hasDescription: false, hasLink: false },
  { key: "process_steps", label: "How Do We Work? (Steps)", hasDescription: true, hasLink: false },
];

export default function AdminSiteContent() {
  return (
    <SiteContentManager
      title="Site Content"
      description="Manage the homepage sections that used to be hardcoded in the code — specialties, services, and the 'How Do We Work?' steps. Looking for the About page? That's under About Page in the sidebar."
      sections={SECTIONS}
    />
  );
}