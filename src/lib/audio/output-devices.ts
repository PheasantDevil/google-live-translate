export interface AudioOutputDevice {
  deviceId: string;
  label: string;
}

export const OUTPUT_DEVICE_STORAGE_KEY = "google-live-translate:output-device";

export function supportsSinkId(): boolean {
  return typeof AudioContext !== "undefined" && "setSinkId" in AudioContext.prototype;
}

export async function listOutputDevices(): Promise<AudioOutputDevice[]> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [{ deviceId: "default", label: "デフォルト" }];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const outputs = devices
    .filter((device) => device.kind === "audiooutput")
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label || `出力デバイス ${index + 1}`,
    }));

  if (outputs.length === 0) {
    return [{ deviceId: "default", label: "デフォルト" }];
  }

  return outputs;
}
