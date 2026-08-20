"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/constants/languages";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-muted">翻訳先の言語</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name} ({language.nativeName})
          </option>
        ))}
      </select>
    </label>
  );
}
