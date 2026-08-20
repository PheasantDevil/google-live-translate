export const GEMINI_LIVE_TRANSLATE_MODEL = "gemini-3.5-live-translate-preview";

export const INPUT_SAMPLE_RATE = 16000;
export const OUTPUT_SAMPLE_RATE = 24000;
export const CHUNK_INTERVAL_MS = 100;

export const SUPPORTED_LANGUAGES = [
  { code: "ja", name: "日本語", nativeName: "日本語" },
  { code: "en", name: "英語", nativeName: "English" },
  { code: "zh", name: "中国語", nativeName: "中文" },
  { code: "ko", name: "韓国語", nativeName: "한국어" },
  { code: "es", name: "スペイン語", nativeName: "Español" },
  { code: "fr", name: "フランス語", nativeName: "Français" },
  { code: "de", name: "ドイツ語", nativeName: "Deutsch" },
  { code: "it", name: "イタリア語", nativeName: "Italiano" },
  { code: "pt", name: "ポルトガル語", nativeName: "Português" },
  { code: "ru", name: "ロシア語", nativeName: "Русский" },
  { code: "ar", name: "アラビア語", nativeName: "العربية" },
  { code: "hi", name: "ヒンディー語", nativeName: "हिन्दी" },
  { code: "th", name: "タイ語", nativeName: "ไทย" },
  { code: "vi", name: "ベトナム語", nativeName: "Tiếng Việt" },
  { code: "id", name: "インドネシア語", nativeName: "Bahasa Indonesia" },
  { code: "tr", name: "トルコ語", nativeName: "Türkçe" },
  { code: "pl", name: "ポーランド語", nativeName: "Polski" },
  { code: "nl", name: "オランダ語", nativeName: "Nederlands" },
  { code: "sv", name: "スウェーデン語", nativeName: "Svenska" },
  { code: "uk", name: "ウクライナ語", nativeName: "Українська" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_TARGET_LANGUAGE: LanguageCode = "ja";

export const LANGUAGE_STORAGE_KEY = "google-live-translate:target-language";

export function isSupportedLanguage(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}

export function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.name ?? code;
}
