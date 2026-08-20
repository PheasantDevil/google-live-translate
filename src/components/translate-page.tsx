"use client";

import Link from "next/link";
import { AudioLevelMeter } from "@/components/audio-level-meter";
import { LanguageSelector } from "@/components/language-selector";
import { SessionControls } from "@/components/session-controls";
import { StatusIndicator } from "@/components/status-indicator";
import { SubtitlePanel } from "@/components/subtitle-panel";
import { useTranslate } from "@/context/translate-context";

export function TranslatePage() {
  const {
    status,
    targetLanguage,
    subtitles,
    audioLevel,
    error,
    isActive,
    setTargetLanguage,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
  } = useTranslate();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6 sm:px-6">
      <header className="mb-8 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Live Translate</h1>
          <Link
            href="/docs/design.html"
            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            設計書
          </Link>
        </div>
        <p className="text-sm text-muted">マイクで話すと、リアルタイムで翻訳音声が再生されます。</p>
      </header>

      <section className="flex flex-1 flex-col gap-5">
        <StatusIndicator status={status} />

        <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} disabled={isActive} />

        {isActive && <AudioLevelMeter level={audioLevel} />}

        <div className="space-y-2">
          <h2 className="text-sm text-muted">字幕</h2>
          <SubtitlePanel lines={subtitles} />
        </div>

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error.message}
          </div>
        )}

        {!isActive && status === "idle" && (
          <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
            ヘッドフォンを接続すると周囲に聞こえにくくなります。HTTPS 環境でマイク権限が必要です。
          </div>
        )}
      </section>

      <footer className="sticky bottom-0 mt-8 bg-background/95 pb-4 pt-2 backdrop-blur">
        <SessionControls
          status={status}
          onStart={() => void startSession()}
          onStop={() => void stopSession()}
          onPause={pauseSession}
          onResume={resumeSession}
        />
      </footer>
    </main>
  );
}
