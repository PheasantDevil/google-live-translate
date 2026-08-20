"use client";

import type { SessionStats } from "@/lib/types/translate";

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface SessionStatsPanelProps {
  stats: SessionStats;
  visible: boolean;
}

export function SessionStatsPanel({ stats, visible }: SessionStatsPanelProps) {
  if (!visible) return null;

  return (
    <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-surface px-4 py-4 text-center">
      <div>
        <p className="text-xs text-muted">セッション時間</p>
        <p className="text-lg font-semibold">{formatDuration(stats.sessionDurationMs)}</p>
      </div>
      <div>
        <p className="text-xs text-muted">再接続</p>
        <p className="text-lg font-semibold">{stats.reconnectCount}</p>
      </div>
      <div>
        <p className="text-xs text-muted">字幕</p>
        <p className="text-lg font-semibold">{stats.subtitleCount}</p>
      </div>
    </div>
  );
}
