import React from "react";
import SiteContentManager from "@/pages/admin/SiteContentManager";
import {
  DISCLAIMER_BOX_SECTION,
  DISCLAIMER_HEADER_SECTION,
  DISCLAIMER_SECTIONS_SECTION,
  DEFAULT_DISCLAIMER_BOX,
  DEFAULT_DISCLAIMER_HEADER,
  DEFAULT_DISCLAIMER_SECTIONS,
} from "@/lib/medicalDisclaimer";

// Admin → Medical Disclaimer: the box on doctor/treatment pages and the full
// /medical-disclaimer page. Empty tabs show the website's default text and
// can be filled with it in one click.
const SECTIONS = [
  {
    key: DISCLAIMER_BOX_SECTION,
    label: "Profile Box",
    singleton: true,
    hasDescription: true,
    hasLink: false,
    hasIcon: false,
    titleLabel: "Heading",
    titlePlaceholder: "Medical Disclaimer",
    descLabel: "Disclaimer text",
    descPlaceholder: "AlHind Lifecare acts as a medical tourism and patient coordination facilitator…",
    descRows: 6,
    defaults: [DEFAULT_DISCLAIMER_BOX],
    help: "Yeh peela box har doctor aur treatment page par \"International Patient Journey\" ke neeche dikhta hai, aur Medical Disclaimer page ke sabse upar bhi.",
  },
  {
    key: DISCLAIMER_HEADER_SECTION,
    label: "Page Header",
    singleton: true,
    hasDescription: true,
    hasLink: false,
    hasIcon: false,
    titleLabel: "Page heading",
    titlePlaceholder: "Medical Disclaimer",
    descLabel: "Line under the heading",
    descPlaceholder: "Last Updated: November 17, 2026 · AlHind Lifecare",
    defaults: [DEFAULT_DISCLAIMER_HEADER],
    help: "Medical Disclaimer page (/medical-disclaimer) ki sabse upar wali heading aur uske neeche ki line.",
  },
  {
    key: DISCLAIMER_SECTIONS_SECTION,
    label: "Page Sections",
    hasDescription: true,
    hasLink: false,
    hasIcon: false,
    titleLabel: "Section heading",
    titlePlaceholder: "e.g. No Medical Advice",
    descLabel: "Section text",
    descPlaceholder: "Paragraph likhein. Naya paragraph: ek khali line chhodein.\n- Bullet point ke liye line ko \"-\" se shuru karein",
    descRows: 7,
    defaults: DEFAULT_DISCLAIMER_SECTIONS,
    help: "Page par 01, 02, 03… numbered cards. Order \"Sort Order\" se tay hota hai; \"Inactive\" karne par card chhup jata hai.\nText me: naya paragraph = ek khali line; bullet point = line \"-\" se shuru karein.",
  },
];

export default function AdminDisclaimerContent() {
  return (
    <SiteContentManager
      title="Medical Disclaimer"
      description="Doctor/treatment pages ka Medical Disclaimer box aur poora Medical Disclaimer page yahan se edit karein."
      sections={SECTIONS}
    />
  );
}