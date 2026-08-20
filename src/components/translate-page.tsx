"use client";

import Link from "next/link";
import { AudioLevelMeter } from "@/components/audio-level-meter";
import { LanguageSelector } from "@/components/language-selector";
import { OutputDeviceSelector } from "@/components/output-device-selector";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { SessionControls } from "@/components/session-controls";
import { SessionStatsPanel } from "@/components/session-stats-panel";
import { StatusIndicator } from "@/components/status-indicator";
import { SubtitlePanel } from "@/components/subtitle-panel";
import { useTranslate } from "@/context/translate-context";

export function TranslatePage() {
  const {
    status,
    targetLanguage,
    outputDeviceId,
    subtitles,
    audioLevel,
    error,
    sessionStats,
    isActive,
    setTargetLanguage,
    setOutputDevice,
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
        <PwaInstallBanner />

        <StatusIndicator status={status} reconnectCount={sessionStats.reconnectCount} />

        <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} disabled={isActive} />

        <OutputDeviceSelector
          value={outputDeviceId}
          onChange={(deviceId) => void setOutputDevice(deviceId)}
          disabled={false}
        />

        <SessionStatsPanel stats={sessionStats} visible={isActive} />

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
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              ヘッドフォンを接続し、出力デバイスを選択すると周囲に聞こえにくくなります。HTTPS
              環境でマイク権限が必要です。
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              長時間利用時は自動再接続されます。iOS ではタブを前面に保つと安定します。
            </div>
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
