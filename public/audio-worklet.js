class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this._buffer = [];
    this._targetSampleRate = options.processorOptions?.targetSampleRate ?? 16000;
    this._chunkSamples = Math.floor((this._targetSampleRate * 100) / 1000);
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;

    const downsampleRatio = sampleRate / this._targetSampleRate;
    for (let i = 0; i < input.length;) {
      this._buffer.push(input[Math.floor(i)]);
      i += downsampleRatio;
    }

    while (this._buffer.length >= this._chunkSamples) {
      const chunk = this._buffer.splice(0, this._chunkSamples);
      const pcm = new Int16Array(chunk.length);
      let sumSquares = 0;

      for (let i = 0; i < chunk.length; i++) {
        const sample = Math.max(-1, Math.min(1, chunk[i]));
        pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        sumSquares += sample * sample;
      }

      const level = Math.sqrt(sumSquares / chunk.length);
      this.port.postMessage({ type: "chunk", pcm: pcm.buffer, level }, [pcm.buffer]);
    }

    return true;
  }
}

registerProcessor("pcm-capture-processor", PcmCaptureProcessor);
