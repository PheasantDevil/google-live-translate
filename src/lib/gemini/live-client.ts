import { GoogleGenAI, Modality, type Session } from "@google/genai";
import { GEMINI_LIVE_TRANSLATE_MODEL, INPUT_SAMPLE_RATE } from "@/lib/constants/languages";
import type { SubtitleLine } from "@/lib/types/translate";

export interface LiveClientCallbacks {
  onOpen?: () => void;
  onClose?: (reason?: string) => void;
  onError?: (error: Error) => void;
  onSubtitle?: (line: SubtitleLine) => void;
  onAudio?: (pcm: Int16Array) => void;
  onGoAway?: (timeLeft?: string) => void;
}

function pcmToBase64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToPcm(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

export class GeminiLiveClient {
  private session: Session | null = null;
  private ai: GoogleGenAI | null = null;
  private pendingSubtitleId: string | null = null;

  async connect(ephemeralToken: string, callbacks: LiveClientCallbacks): Promise<void> {
    this.ai = new GoogleGenAI({
      apiKey: ephemeralToken,
      httpOptions: { apiVersion: "v1alpha" },
    });

    this.session = await this.ai.live.connect({
      model: GEMINI_LIVE_TRANSLATE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => callbacks.onOpen?.(),
        onclose: (event) => callbacks.onClose?.(event.reason),
        onerror: (event) => callbacks.onError?.(new Error(event.message ?? "Live API error")),
        onmessage: (message) => {
          const content = message.serverContent;
          if (!content) return;

          if (content.inputTranscription?.text) {
            // Input transcript available for debugging; subtitles use output transcription.
          }

          if (content.outputTranscription?.text) {
            const text = content.outputTranscription.text;
            const id = this.pendingSubtitleId ?? crypto.randomUUID();
            this.pendingSubtitleId = id;
            callbacks.onSubtitle?.({
              id,
              text,
              timestamp: Date.now(),
              isFinal: Boolean(content.turnComplete),
            });
            if (content.turnComplete) {
              this.pendingSubtitleId = null;
            }
          }

          if (content.modelTurn?.parts) {
            for (const part of content.modelTurn.parts) {
              if (part.inlineData?.data) {
                callbacks.onAudio?.(base64ToPcm(part.inlineData.data));
              }
            }
          }

          if (message.goAway) {
            callbacks.onGoAway?.(message.goAway.timeLeft);
          }
        },
      },
    });
  }

  sendAudio(pcm: Int16Array): void {
    if (!this.session) return;
    this.session.sendRealtimeInput({
      audio: {
        mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
        data: pcmToBase64(pcm),
      },
    });
  }

  async disconnect(): Promise<void> {
    this.session?.close();
    this.session = null;
    this.ai = null;
    this.pendingSubtitleId = null;
  }
}
