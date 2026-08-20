"use client";

import type { SessionStatus } from "@/lib/types/translate";

const STATUS_LABELS: Record<SessionStatus, string> = {
  idle: "待機中",
  requesting_mic: "マイク権限を確認中…",
  connecting: "接続中…",
  translating: "翻訳中",
  paused: "一時停止中",
  reconnecting: "再接続中…",
  error: "エラー",
};

const STATUS_COLORS: Record<SessionStatus, string> = {
  idle: "bg-muted",
  requesting_mic: "bg-accent",
  connecting: "bg-accent",
  translating: "bg-success",
  paused: "bg-muted",
  reconnecting: "bg-accent",
  error: "bg-danger",
};

interface StatusIndicatorProps {
  status: SessionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const isLive = status === "translating" || status === "reconnecting";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <div className="relative flex h-3 w-3 items-center justify-center">
        {isLive && <span className="pulse-ring absolute h-3 w-3 rounded-full bg-success" />}
        <span className={`relative h-3 w-3 rounded-full ${STATUS_COLORS[status]}`} />
      </div>
      <div>
        <p className="text-sm font-medium">{STATUS_LABELS[status]}</p>
        {isLive && <p className="text-xs text-muted">マイクに向かって話してください</p>}
      </div>
    </div>
  );
}
