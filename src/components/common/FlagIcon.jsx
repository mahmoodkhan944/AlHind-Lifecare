import React from "react";

/**
 * Turns a flag emoji (🇮🇳) into its 2-letter country code ("in").
 * A flag emoji is two "regional indicator" characters, one per letter.
 */
function emojiToCode(emoji) {
  const letters = Array.from(emoji || "")
    .map((ch) => ch.codePointAt(0) - 0x1f1e6)
    .filter((n) => n >= 0 && n < 26)
    .map((n) => String.fromCharCode(97 + n));
  return letters.length === 2 ? letters.join("") : "";
}

/**
 * Shows a country flag as a small image, so it looks the same on every
 * device. (Windows doesn't draw flag emojis — it shows "IN", "GB" instead.)
 *
 * Pass either `code` ("IN") or `emoji` ("🇮🇳").
 */
export default function FlagIcon({ code, emoji, className = "" }) {
  const cc = (code || emojiToCode(emoji)).toLowerCase();
  if (!/^[a-z]{2}$/.test(cc)) return null;

  return (
    <img
      src={`https://flagcdn.com/w20/${cc}.png`}
      srcSet={`https://flagcdn.com/w40/${cc}.png 2x`}
      width={20}
      height={15}
      alt=""
      loading="lazy"
      className={`inline-block w-5 h-[15px] rounded-[2px] object-cover shrink-0 ${className}`}
    />
  );
}