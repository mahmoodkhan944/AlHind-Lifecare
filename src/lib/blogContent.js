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