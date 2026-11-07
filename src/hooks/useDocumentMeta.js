import { useEffect } from "react";

/**
 * Sets SEO tags in document.head only — nothing here ever renders in the
 * visible page. Search engines and AI search tools read these tags.
 *
 *  title       → <title>
 *  description → <meta name="description">
 *  keywords    → <meta name="keywords">
 *  canonical   → <link rel="canonical"> (the preferred URL of the page)
 *  jsonLd      → <script type="application/ld+json"> structured data
 *               (schema.org), e.g. a Physician with location & speciality
 *
 * Everything is restored/removed on unmount, so navigating to another page
 * doesn't leave stale SEO tags behind.
 */
function setHeadTag(selector, create, attr, value) {
  let el = document.head.querySelector(selector);
  const created = !el;
  const previous = el ? el.getAttribute(attr) : null;
  if (!value) return () => {};
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
  return () => {
    if (created) el.remove();
    else if (previous !== null) el.setAttribute(attr, previous);
  };
}

export function useDocumentMeta({ title, description, keywords, canonical, jsonLd }) {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;

    const meta = (name) => () => {
      const m = document.createElement("meta");
      m.setAttribute("name", name);
      return m;
    };
    const undo = [
      setHeadTag('meta[name="description"]', meta("description"), "content", description),
      setHeadTag('meta[name="keywords"]', meta("keywords"), "content", keywords),
      setHeadTag(
        'link[rel="canonical"]',
        () => {
          const l = document.createElement("link");
          l.setAttribute("rel", "canonical");
          return l;
        },
        "href",
        canonical
      ),
    ];

    let script = null;
    if (jsonLdText) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-page-jsonld", "true");
      script.textContent = jsonLdText;
      document.head.appendChild(script);
    }

    return () => {
      document.title = previousTitle;
      undo.forEach((fn) => fn());
      if (script) script.remove();
    };
  }, [title, description, keywords, canonical, jsonLdText]);
}