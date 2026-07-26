import React, { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية (Arabic)", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা (Bengali)", flag: "🇧🇩" },
  { code: "ur", name: "اردو (Urdu)", flag: "🇵🇰" },
  { code: "fa", name: "فارسی (Persian)", flag: "🇮🇷" },
  { code: "ps", name: "پښتو (Pashto)", flag: "🇦🇫" },
  { code: "fr", name: "Français (French)", flag: "🇫🇷" },
  { code: "es", name: "Español (Spanish)", flag: "🇪🇸" },
  { code: "de", name: "Deutsch (German)", flag: "🇩🇪" },
  { code: "tr", name: "Türkçe (Turkish)", flag: "🇹🇷" },
  { code: "ru", name: "Русский (Russian)", flag: "🇷🇺" },
  { code: "uk", name: "Українська (Ukrainian)", flag: "🇺🇦" },
  { code: "zh-CN", name: "中文 (Chinese)", flag: "🇨🇳" },
  { code: "ja", name: "日本語 (Japanese)", flag: "🇯🇵" },
  { code: "ko", name: "한국어 (Korean)", flag: "🇰🇷" },
  { code: "th", name: "ไทย (Thai)", flag: "🇹🇭" },
  { code: "vi", name: "Tiếng Việt (Vietnamese)", flag: "🇻🇳" },
  { code: "id", name: "Indonesia", flag: "🇮🇩" },
  { code: "ms", name: "Melayu (Malay)", flag: "🇲🇾" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "ne", name: "नेपाली (Nepali)", flag: "🇳🇵" },
  { code: "si", name: "සිංහල (Sinhala)", flag: "🇱🇰" },
  { code: "ta", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { code: "ml", name: "മലയാളം (Malayalam)", flag: "🇮🇳" },
  { code: "mr", name: "मराठी (Marathi)", flag: "🇮🇳" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
  { code: "gu", name: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { code: "pt", name: "Português (Portuguese)", flag: "🇵🇹" },
  { code: "it", name: "Italiano (Italian)", flag: "🇮🇹" },
  { code: "nl", name: "Nederlands (Dutch)", flag: "🇳🇱" },
  { code: "pl", name: "Polski (Polish)", flag: "🇵🇱" },
  { code: "he", name: "עברית (Hebrew)", flag: "🇮🇱" },
  { code: "sw", name: "Kiswahili (Swahili)", flag: "🇰🇪" },
  { code: "am", name: "አማርኛ (Amharic)", flag: "🇪🇹" },
  { code: "so", name: "Soomaali (Somali)", flag: "🇸🇴" },
  { code: "kk", name: "Қазақ (Kazakh)", flag: "🇰🇿" },
  { code: "uz", name: "O'zbek (Uzbek)", flag: "🇺🇿" },
  { code: "my", name: "ဗမာ (Burmese)", flag: "🇲🇲" },
  { code: "km", name: "ខ្មែរ (Khmer)", flag: "🇰🇭" },
];

const SOURCE_LANG = "en";

export default function LanguageSelector({ light = false }) {
  const [currentLang, setCurrentLang] = useState(SOURCE_LANG);
  const initialized = useRef(false);

  useEffect(() => {
    // Read current language from cookie
    const match = document.cookie.match(/googtrans=\/[^/]*\/([^;]+)/);
    if (match) setCurrentLang(match[1]);

    // Create hidden container for Google Translate widget
    let container = document.getElementById("google_translate_element");
    if (!container) {
      container = document.createElement("div");
      container.id = "google_translate_element";
      container.style.display = "none";
      document.body.appendChild(container);
    }

    // Define the init callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement && !initialized.current) {
        initialized.current = true;
        new window.google.translate.TranslateElement(
          { pageLanguage: SOURCE_LANG, autoDisplay: false },
          "google_translate_element"
        );
      }
    };

    // If Google Translate is already loaded (script present), call init directly
    if (window.google?.translate?.TranslateElement && !initialized.current) {
      window.googleTranslateElementInit();
    }

    // Load script if not present
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (langCode) => {
    setCurrentLang(langCode);
    if (langCode === SOURCE_LANG) {
      // Reset to original language
      document.cookie = "googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "googtrans=;path=/;domain=" + window.location.hostname + ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } else {
      const value = `/${SOURCE_LANG}/${langCode}`;
      document.cookie = `googtrans=${value};path=/`;
      document.cookie = `googtrans=${value};path=/;domain=.${window.location.hostname}`;
    }
    window.location.reload();
  };

  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <Select value={currentLang} onValueChange={handleChange}>
      <SelectTrigger
        className={`h-8 w-auto gap-1.5 border-none px-2.5 text-xs font-semibold rounded-full focus:ring-0 ${
          light
            ? "text-white bg-white/10 hover:bg-white/20"
            : "text-foreground bg-muted/60 hover:bg-muted"
        }`}
      >
        <Globe className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{current.flag} {current.code.toUpperCase()}</span>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="mr-2">{lang.flag}</span> {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}