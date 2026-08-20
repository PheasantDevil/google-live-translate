"use client";

import type { SessionStatus } from "@/lib/types/translate";

interface SessionControlsProps {
  status: SessionStatus;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function SessionControls({
  status,
  onStart,
  onStop,
  onPause,
  onResume,
}: SessionControlsProps) {
  const isBusy = ["requesting_mic", "connecting", "reconnecting"].includes(status);
  const isTranslating = status === "translating";
  const isPaused = status === "paused";
  const canStart = status === "idle" || status === "error";

  return (
    <div className="flex flex-wrap gap-3">
      {canStart && (
        <button
          type="button"
          onClick={onStart}
          disabled={isBusy}
          className="flex-1 rounded-full bg-accent px-6 py-4 text-base font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          翻訳を開始
        </button>
      )}

      {isTranslating && (
        <button
          type="button"
          onClick={onPause}
          className="flex-1 rounded-full border border-border bg-surface px-6 py-4 text-base font-semibold transition hover:bg-surface-2"
        >
          一時停止
        </button>
      )}

      {isPaused && (
        <button
          type="button"
          onClick={onResume}
          className="flex-1 rounded-full bg-accent px-6 py-4 text-base font-semibold text-white transition hover:bg-accent-hover"
        >
          再開
        </button>
      )}

      {!canStart && (
        <button
          type="button"
          onClick={onStop}
          disabled={isBusy}
          className="flex-1 rounded-full border border-danger/40 bg-surface px-6 py-4 text-base font-semibold text-danger transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          停止
        </button>
      )}
    </div>
  );
}
