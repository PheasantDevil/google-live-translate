import { AudioCapture } from "@/lib/audio/capture";
import { AudioPlayback } from "@/lib/audio/playback";
import { GeminiLiveClient } from "@/lib/gemini/live-client";
import { fetchLiveToken } from "@/lib/gemini/token";
import type { SubtitleLine } from "@/lib/types/translate";

export interface SessionManagerCallbacks {
  onStatusChange?: (status: SessionManagerStatus) => void;
  onSubtitle?: (line: SubtitleLine) => void;
  onAudioLevel?: (level: number) => void;
  onError?: (error: Error) => void;
}

export type SessionManagerStatus =
  "idle" | "requesting_mic" | "connecting" | "translating" | "paused" | "reconnecting" | "error";

export class TranslateSessionManager {
  private capture = new AudioCapture();
  private playback = new AudioPlayback();
  private liveClient = new GeminiLiveClient();
  private callbacks: SessionManagerCallbacks = {};
  private targetLanguage = "ja";
  private active = false;
  private paused = false;

  setCallbacks(callbacks: SessionManagerCallbacks): void {
    this.callbacks = callbacks;
  }

  private setStatus(status: SessionManagerStatus): void {
    this.callbacks.onStatusChange?.(status);
  }

  async start(targetLanguage: string): Promise<void> {
    if (this.active) return;

    this.targetLanguage = targetLanguage;
    this.active = true;
    this.paused = false;

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

      await this.connectLiveSession();
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

    await this.liveClient.connect(token, {
      onOpen: () => this.setStatus("translating"),
      onClose: () => {
        if (this.active) {
          this.setStatus("idle");
        }
      },
      onError: (error) => {
        this.setStatus("error");
        this.callbacks.onError?.(error);
      },
      onSubtitle: (line) => this.callbacks.onSubtitle?.(line),
      onAudio: async (pcm) => {
        if (!this.paused) {
          await this.playback.enqueuePcm(pcm);
        }
      },
      onGoAway: async () => {
        if (!this.active) return;
        this.setStatus("reconnecting");
        await this.liveClient.disconnect();
        await this.connectLiveSession();
      },
    });
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
    await this.cleanup();
    this.setStatus("idle");
  }

  private async cleanup(): Promise<void> {
    await Promise.allSettled([
      this.capture.stop(),
      this.liveClient.disconnect(),
      this.playback.close(),
    ]);
  }
}
