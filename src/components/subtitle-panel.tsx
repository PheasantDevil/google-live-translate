"use client";

import type { SubtitleLine } from "@/lib/types/translate";

interface SubtitlePanelProps {
  lines: SubtitleLine[];
}

export function SubtitlePanel({ lines }: SubtitlePanelProps) {
  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-8 text-center text-sm text-muted">
        翻訳テキストがここに表示されます
      </div>
    );
  }

  return (
    <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border bg-surface px-4 py-4">
      {lines.map((line) => (
        <p
          key={line.id}
          className={`text-sm leading-relaxed ${line.isFinal ? "text-foreground" : "text-muted"}`}
        >
          {line.text}
        </p>
      ))}
    </div>
  );
}
