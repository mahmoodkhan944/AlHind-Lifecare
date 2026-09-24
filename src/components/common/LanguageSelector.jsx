import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Languages, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import FlagIcon from "@/components/common/FlagIcon";

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

// Shown first — the languages most of our international patients use
const POPULAR = ["en", "ar", "hi", "ur", "bn", "fr", "ru"];

const SOURCE_LANG = "en";

// "العربية (Arabic)" -> { native: "العربية", english: "Arabic" }
function splitName(name) {
  const m = name.match(/^(.*?)\s*\(([^)]+)\)$/);
  return m ? { native: m[1], english: m[2] } : { native: name, english: "" };
}

export default function LanguageSelector({ light = false }) {
  const [currentLang, setCurrentLang] = useState(SOURCE_LANG);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
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
    setOpen(false);
    if (langCode === currentLang) return;
    setCurrentLang(langCode);
    setSwitching(true);
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
  const popular = POPULAR.map((c) => LANGUAGES.find((l) => l.code === c)).filter(Boolean);
  const others = LANGUAGES.filter((l) => !POPULAR.includes(l.code));

  const renderItem = (lang) => {
    const { native, english } = splitName(lang.name);
    const selected = lang.code === currentLang;
    return (
      <CommandItem
        key={lang.code}
        value={`${lang.code} ${native} ${english}`}
        onSelect={() => handleChange(lang.code)}
        className={`gap-3 rounded-lg px-2.5 py-2 cursor-pointer ${
          selected ? "bg-primary/10 data-[selected=true]:bg-primary/15" : ""
        }`}
      >
        <FlagIcon emoji={lang.flag} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span dir="auto" className={`truncate text-left text-sm ${selected ? "font-semibold text-primary" : "font-medium"}`}>
            {native}
          </span>
          {english && <span className="truncate text-[11px] text-muted-foreground">{english}</span>}
        </span>
        {selected && <Check className="text-primary" />}
      </CommandItem>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Language: ${splitName(current.name).english || current.name}`}
          className={`notranslate group inline-flex h-9 items-center gap-2 rounded-full border pl-2 pr-2.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            light
              ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
              : "border-border bg-muted/60 text-foreground hover:bg-muted"
          }`}
        >
          {switching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/10">
              <FlagIcon emoji={current.flag} className="!h-5 !w-7 !rounded-none" />
            </span>
          )}
          <span>{current.code.split("-")[0].toUpperCase()}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="notranslate w-72 overflow-hidden rounded-2xl p-0 shadow-xl">
        <div className="flex items-center gap-2.5 border-b bg-muted/40 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Languages className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Choose language</p>
            <p className="text-[11px] text-muted-foreground">Page is translated automatically</p>
          </div>
        </div>

        <Command filter={(value, search) => (value.toLowerCase().includes(search.trim().toLowerCase()) ? 1 : 0)}>
          <CommandInput placeholder="Search language..." className="h-10 text-sm" />
          <CommandList className="max-h-72 p-1">
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup heading="Popular">{popular.map(renderItem)}</CommandGroup>
            <CommandSeparator className="my-1" />
            <CommandGroup heading="All languages">{others.map(renderItem)}</CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}