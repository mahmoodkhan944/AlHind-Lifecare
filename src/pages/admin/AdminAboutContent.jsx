import React from "react";
import SiteContentManager from "@/pages/admin/SiteContentManager";

// Every admin-editable block on the About page (src/pages/About.jsx), in
// the order they appear on the page.
const SECTIONS = [
  {
    key: "about_hero",
    label: "Hero",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtitle",
    hasLink: false,
    hasImage: true,
    titleLabel: "Heading (H1)",
  },
  {
    key: "about_intro",
    label: "Intro Section",
    singleton: true,
    hasDescription: true,
    descLabel: "Paragraphs (leave a blank line between paragraphs)",
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Your Health, Our Priority",
    hasImage: true,
    titleLabel: "Heading",
  },
  { key: "about_intro_features", label: "Intro Feature Icons", hasDescription: false, hasLink: false },
  { key: "about_mission_vision", label: "Mission & Vision", hasDescription: true, hasLink: false },
  { key: "about_stats", label: "Stats", hasDescription: true, hasLink: false, descLabel: "Label (e.g. Happy Patients)", titleLabel: "Value (e.g. 50,000+)" },
  {
    key: "about_services_header",
    label: "Services Header",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtext",
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Our Services",
    titleLabel: "Heading",
  },
  { key: "about_services", label: "What We Offer", hasDescription: false, hasLink: false },
  {
    key: "about_trust_header",
    label: "Trust Header",
    singleton: true,
    hasDescription: false,
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Why Patients Trust Us",
    titleLabel: "Heading",
  },
  { key: "about_trust_rows", label: "Why Patients Trust Us", hasDescription: true, hasLink: false, hasImage: true },
  {
    key: "about_help_header",
    label: "Help Header",
    singleton: true,
    hasDescription: false,
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "How We Help You",
    titleLabel: "Heading",
  },
  { key: "about_help_groups", label: "How We Help (Groups)", hasDescription: true, hasLink: false, descLabel: "Points (one per line)" },
  {
    key: "about_leadership_header",
    label: "Leadership Header",
    singleton: true,
    hasDescription: true,
    descLabel: "Subtext",
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Leadership",
    titleLabel: "Heading",
  },
  { key: "about_team", label: "Leadership Team", hasDescription: true, hasLink: true, hasImage: true, descLabel: "Role / Title", titleLabel: "Name", linkLabel: "LinkedIn URL" },
  {
    key: "about_advantages_header",
    label: "Advantages Header",
    singleton: true,
    hasDescription: false,
    hasLink: true,
    linkLabel: "Eyebrow Badge Text",
    linkPlaceholder: "Advantages",
    titleLabel: "Heading",
  },
  { key: "about_advantages", label: "Advantages", hasDescription: true, hasLink: false },
];

export default function AdminAboutContent() {
  return (
    <SiteContentManager
      title="About Page"
      description="Every editable block on the About page, top to bottom — hero, intro copy, mission & vision, section headings, and the lists below them (services, trust rows, help groups, team, advantages)."
      sections={SECTIONS}
    />
  );
}