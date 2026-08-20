import { INPUT_SAMPLE_RATE } from "@/lib/constants/languages";

export interface AudioCaptureCallbacks {
  onChunk: (pcm: Int16Array) => void;
  onLevel?: (level: number) => void;
  onError?: (error: Error) => void;
}

export class AudioCapture {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  async start(callbacks: AudioCaptureCallbacks): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("Audio capture is only available in the browser");
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("このブラウザはマイク入力に対応していません");
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.audioContext = new AudioContext();
    await this.audioContext.audioWorklet.addModule("/audio-worklet.js");

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.workletNode = new AudioWorkletNode(this.audioContext, "pcm-capture-processor", {
      processorOptions: { targetSampleRate: INPUT_SAMPLE_RATE },
    });

    this.workletNode.port.onmessage = (event: MessageEvent) => {
      const data = event.data as { type: string; pcm?: ArrayBuffer; level?: number };
      if (data.type === "chunk" && data.pcm) {
        callbacks.onChunk(new Int16Array(data.pcm));
        callbacks.onLevel?.(data.level ?? 0);
      }
    };

    this.sourceNode.connect(this.workletNode);
    await this.audioContext.resume();
  }

  async stop(): Promise<void> {
    this.workletNode?.disconnect();
    this.sourceNode?.disconnect();
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    await this.audioContext?.close();

    this.workletNode = null;
    this.sourceNode = null;
    this.mediaStream = null;
    this.audioContext = null;
  }
}
