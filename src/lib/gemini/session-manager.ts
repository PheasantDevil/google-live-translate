import { AudioCapture } from "@/lib/audio/capture";
import { AudioPlayback } from "@/lib/audio/playback";
import { GeminiLiveClient } from "@/lib/gemini/live-client";
import { fetchLiveToken } from "@/lib/gemini/token";
import { computeBackoffMs, parseGoAwayDelay, sleep } from "@/lib/session/reconnect";
import { WakeLockManager } from "@/lib/session/wake-lock";
import type { SessionStats, SubtitleLine } from "@/lib/types/translate";

export interface SessionManagerCallbacks {
  onStatusChange?: (status: SessionManagerStatus) => void;
  onSubtitle?: (line: SubtitleLine) => void;
  onAudioLevel?: (level: number) => void;
  onError?: (error: Error) => void;
  onSessionStats?: (stats: Partial<SessionStats>) => void;
}

export type SessionManagerStatus =
  "idle" | "requesting_mic" | "connecting" | "translating" | "paused" | "reconnecting" | "error";

const MAX_RECONNECT_ATTEMPTS = 5;

export class TranslateSessionManager {
  private capture = new AudioCapture();
  private playback = new AudioPlayback();
  private liveClient = new GeminiLiveClient();
  private wakeLock = new WakeLockManager();
  private callbacks: SessionManagerCallbacks = {};
  private targetLanguage = "ja";
  private active = false;
  private paused = false;
  private reconnectInProgress = false;
  private reconnectAttempts = 0;
  private subtitleCount = 0;
  private sessionStartedAt: number | null = null;

  setCallbacks(callbacks: SessionManagerCallbacks): void {
    this.callbacks = callbacks;
  }

  async setOutputDevice(deviceId: string): Promise<void> {
    await this.playback.setOutputDevice(deviceId);
  }

  private setStatus(status: SessionManagerStatus): void {
    this.callbacks.onStatusChange?.(status);
  }

  private emitStats(partial: Partial<SessionStats>): void {
    this.callbacks.onSessionStats?.({
      reconnectCount: this.reconnectAttempts,
      subtitleCount: this.subtitleCount,
      sessionDurationMs: this.sessionStartedAt ? Date.now() - this.sessionStartedAt : 0,
      ...partial,
    });
  }

  async start(targetLanguage: string): Promise<void> {
    if (this.active) return;

    this.targetLanguage = targetLanguage;
    this.active = true;
    this.paused = false;
    this.reconnectAttempts = 0;
    this.subtitleCount = 0;
    this.sessionStartedAt = Date.now();

    try {
      this.setStatus("requesting_mic");
      await this.capture.start({
        onChunk: (pcm) => {
          if (!this.paused) {
            this.liveClient.sendAudio(pcm);
          }
        },
        onLevel: (level) => this.callbacks.onAudioLevel?.(level),
        onError: (error) => this.callbacks.onError?.(error),
      });

      await this.wakeLock.acquire();
      await this.connectLiveSession();
      this.emitStats({});
    } catch (error) {
      this.active = false;
      this.setStatus("error");
      await this.cleanup();
      this.callbacks.onError?.(
        error instanceof Error ? error : new Error("セッションの開始に失敗しました"),
      );
      throw error;
    }
  }

  private async connectLiveSession(): Promise<void> {
    this.setStatus("connecting");
    const { token } = await fetchLiveToken(this.targetLanguage);
    const resumptionHandle = this.liveClient.getResumptionHandle();

    await this.liveClient.connect(
      token,
      {
        onOpen: () => {
          this.reconnectInProgress = false;
          this.setStatus(this.paused ? "paused" : "translating");
          this.emitStats({});
        },
        onClose: () => {
          if (!this.active || this.reconnectInProgress) return;
          void this.scheduleReconnect(0);
        },
        onError: (error) => {
          if (!this.active) return;
          void this.scheduleReconnect(this.reconnectAttempts, error);
        },
        onSubtitle: (line) => {
          this.subtitleCount += 1;
          this.callbacks.onSubtitle?.(line);
          this.emitStats({});
        },
        onAudio: async (pcm) => {
          if (!this.paused) {
            await this.playback.enqueuePcm(pcm);
          }
        },
        onGoAway: (timeLeft) => {
          if (!this.active) return;
          void this.scheduleReconnect(parseGoAwayDelay(timeLeft));
        },
        onResumptionUpdate: () => {
          this.emitStats({});
        },
      },
      { resumptionHandle },
    );
  }

  private async scheduleReconnect(delayMs: number, error?: Error): Promise<void> {
    if (!this.active || this.reconnectInProgress) return;

    this.reconnectInProgress = true;
    this.setStatus("reconnecting");

    if (delayMs > 0) {
      await sleep(delayMs);
    }

    if (!this.active) {
      this.reconnectInProgress = false;
      return;
    }

    while (this.active && this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      try {
        this.reconnectAttempts += 1;
        this.emitStats({});
        await this.liveClient.disconnect();
        await this.connectLiveSession();
        return;
      } catch (reconnectError) {
        const message =
          reconnectError instanceof Error ? reconnectError.message : "再接続に失敗しました";
        if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          this.reconnectInProgress = false;
          this.setStatus("error");
          this.callbacks.onError?.(error ?? new Error(message));
          return;
        }
        await sleep(computeBackoffMs(this.reconnectAttempts));
      }
    }
  }

  pause(): void {
    if (!this.active || this.paused) return;
    this.paused = true;
    this.playback.flush();
    this.setStatus("paused");
  }

  resume(): void {
    if (!this.active || !this.paused) return;
    this.paused = false;
    this.setStatus("translating");
  }

  async stop(): Promise<void> {
    this.active = false;
    this.paused = false;
    this.reconnectInProgress = false;
    await this.cleanup();
    this.setStatus("idle");
    this.sessionStartedAt = null;
  }

  private async cleanup(): Promise<void> {
    await Promise.allSettled([
      this.capture.stop(),
      this.liveClient.disconnect(),
      this.playback.close(),
      this.wakeLock.release(),
    ]);
  }
}
