import React from "react";
import SiteContentManager from "@/pages/admin/SiteContentManager";

// Every admin-editable block on the Home page (src/pages/Home.jsx), in the
// order the sections appear on the page — both the surrounding headline
// copy (badge/heading/subtitle) and the item lists that sit under each
// heading (specialties, process steps, services). Lists that live on their
// own dedicated admin pages already (Doctors, Hospitals, Treatments,
// Testimonials, Blog Posts, FAQs) are NOT duplicated here.
const SECTIONS = [
  {
    key: "home_hero",
    label: "Hero Headline",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtitle",
    hasLink: true,
    linkLabel: "Rest of Heading (after the highlighted word)",
    linkPlaceholder: "Knows No Borders",
    titleLabel: "Highlighted Word (shown in yellow)",
  },
  {
    key: "home_hero_form",
    label: "Hero Quote Form",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtitle",
    hasLink: false,
    titleLabel: "Heading",
  },
  {
    key: "home_hospitals_header",
    label: "Hospitals Header",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtitle",
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Medical Destinations",
    titleLabel: "Heading",
  },
  {
    key: "home_doctors_header",
    label: "Doctors Header",
    singleton: true,
    hasDescription: false,
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Top Doctors",
    titleLabel: "Heading",
  },
  {
    key: "home_specialty_header",
    label: "Specialty Header",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtitle",
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Featured Treatments",
    titleLabel: "Heading",
  },
  { key: "specialties", label: "Multi-Specialty Focus (List)", hasDescription: false, hasLink: true },
  {
    key: "home_lowest_quotes_header",
    label: "Lowest Quotes Header",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtitle",
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Lowest Quotes",
    titleLabel: "Heading",
  },
  {
    key: "home_about",
    label: "About Us Section",
    singleton: true,
    hasDescription: true,
    descLabel: "Paragraph",
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "About Us",
    titleLabel: "Heading",
  },
  {
    key: "home_how_we_work_header",
    label: "How We Work Header",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtitle",
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Process",
    titleLabel: "Heading",
  },
  { key: "process_steps", label: "How Do We Work? (Steps List)", hasDescription: true, hasLink: false },
  {
    key: "home_services_header",
    label: "Services Header",
    singleton: true,
    hasDescription: false,
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Our Services",
    titleLabel: "Heading",
  },
  { key: "services", label: "Our Services (List)", hasDescription: false, hasLink: false },
  {
    key: "home_testimonials_header",
    label: "Testimonials Header",
    singleton: true,
    hasDescription: false,
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Latest Testimonials",
    titleLabel: "Heading",
  },
  {
    key: "home_blogs_header",
    label: "Blog Header",
    singleton: true,
    hasDescription: false,
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "From the Blog",
    titleLabel: "Heading",
  },
  {
    key: "home_faq_header",
    label: "FAQ Header",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtitle",
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "FAQ",
    titleLabel: "Heading",
  },
];

export default function AdminHomeContent() {
  return (
    <SiteContentManager
      title="Homepage"
      description="Every editable block on the homepage, top to bottom — hero headline, the quote form card, every section's heading/subtitle, and the item lists under them (specialties, process steps, services). Doctors, Hospitals, Treatments, Testimonials, Blog Posts, and FAQs are managed from their own tabs in the sidebar."
      sections={SECTIONS}
    />
  );
}