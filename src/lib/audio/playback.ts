import { OUTPUT_SAMPLE_RATE } from "@/lib/constants/languages";

type SetSinkIdCapableContext = AudioContext & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

export class AudioPlayback {
  private audioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private outputDeviceId = "default";

  private ensureContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      this.nextStartTime = 0;
      void this.applyOutputDevice(this.outputDeviceId);
    }
    return this.audioContext;
  }

  async setOutputDevice(deviceId: string): Promise<void> {
    this.outputDeviceId = deviceId;
    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.applyOutputDevice(deviceId);
    }
  }

  private async applyOutputDevice(deviceId: string): Promise<void> {
    const context = this.audioContext as SetSinkIdCapableContext | null;
    if (!context?.setSinkId) return;
    try {
      await context.setSinkId(deviceId);
    } catch {
      // Fall back to default output if the device is unavailable.
    }
  }

  async enqueuePcm(pcm: Int16Array): Promise<void> {
    const context = this.ensureContext();
    if (context.state === "suspended") {
      await context.resume();
    }

    const float32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) {
      float32[i] = pcm[i] / (pcm[i] < 0 ? 0x8000 : 0x7fff);
    }

    const buffer = context.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE);
    buffer.copyToChannel(float32, 0);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);

    const startAt = Math.max(context.currentTime + 0.08, this.nextStartTime);
    source.start(startAt);
    this.nextStartTime = startAt + buffer.duration;
  }

  flush(): void {
    this.nextStartTime = 0;
  }

  async close(): Promise<void> {
    this.flush();
    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.close();
    }
    this.audioContext = null;
  }
}
