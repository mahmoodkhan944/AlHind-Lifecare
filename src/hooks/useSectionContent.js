import { useState, useEffect } from "react";
import { db } from "@/api/dataClient";

/**
 * Fetches one admin-editable {badge, heading, subtitle} block from
 * site_content_items for the given section key, falling back to the
 * supplied defaults until an admin adds a row for that section (via
 * Admin → Homepage). Mirrors the {title, description, link} shape used
 * everywhere else in the CMS: title -> heading, description -> subtitle,
 * link -> badge (reused since these header blocks don't need a link).
 */
export function useSectionContent(section, fallback) {
  const [content, setContent] = useState(fallback);

  useEffect(() => {
    db.entities.SiteContent.filter({ section, status: "active" }, "sort_order", 1)
      .then((data) => {
        if (data.length > 0) {
          const d = data[0];
          setContent({
            badge: d.link || fallback.badge || "",
            heading: d.title,
            subtitle: d.description || fallback.subtitle || "",
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  return content;
}