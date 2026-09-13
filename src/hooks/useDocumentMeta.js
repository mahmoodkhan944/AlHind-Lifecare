import { useEffect } from "react";

/**
 * Sets the browser tab title and the page's <meta name="description"> tag.
 * Nothing from this ever renders in the visible page — it only touches
 * document.head, which is what search engines and link-preview cards read.
 *
 * Restores the previous title/description on unmount, so navigating to
 * another page doesn't leave stale SEO tags behind.
 */
export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;

    let metaTag = document.querySelector('meta[name="description"]');
    const previousDescription = metaTag?.getAttribute("content") ?? null;
    const createdTag = !metaTag;
    if (description) {
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", "description");
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;
      if (metaTag) {
        if (createdTag) {
          metaTag.remove();
        } else if (previousDescription !== null) {
          metaTag.setAttribute("content", previousDescription);
        }
      }
    };
  }, [title, description]);
}