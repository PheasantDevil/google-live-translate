"use client";

interface AudioLevelMeterProps {
  level: number;
}

export function AudioLevelMeter({ level }: AudioLevelMeterProps) {
  const width = `${Math.min(100, Math.round(level * 300))}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>入力レベル</span>
        <span>{Math.round(level * 100)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-all duration-100"
          style={{ width }}
        />
      </div>
    </div>
  );
}
