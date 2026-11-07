import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";

// Looks for real HTML tags the editor produces (<p>, <h2>, <ul>, ...)
const HTML_TAG = /<\/?(p|h[1-6]|ul|ol|li|strong|em|u|s|br|div|blockquote|a|img|span)\b[^>]*>/i;

/**
 * Blog content is saved as HTML by the admin editor. Some older posts were
 * written in Markdown ("## Heading", "- item", "**bold**"). This returns HTML
 * for both, so old and new posts display (and open in the editor) correctly.
 */
export function toBlogHtml(content) {
  const text = String(content || "");
  if (!text.trim()) return "";
  if (HTML_TAG.test(text)) return text;
  return renderToStaticMarkup(React.createElement(Markdown, null, text));
}

/**
 * Order blog posts by the date shown on the post (Publication Date, or the
 * created date when none is set): newest date first. If two posts have the
 * same date, the one created later comes first.
 */
export function sortBlogPosts(posts) {
  const shown = (p) => new Date(p.publication_date || p.created_date || 0).getTime() || 0;
  const created = (p) => new Date(p.created_date || 0).getTime() || 0;
  return [...posts].sort((a, b) => shown(b) - shown(a) || created(b) - created(a));
}