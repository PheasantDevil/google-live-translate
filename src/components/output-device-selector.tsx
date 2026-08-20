"use client";

import { useEffect, useState } from "react";
import {
  listOutputDevices,
  supportsSinkId,
  type AudioOutputDevice,
} from "@/lib/audio/output-devices";

interface OutputDeviceSelectorProps {
  value: string;
  onChange: (deviceId: string) => void;
  disabled?: boolean;
}

export function OutputDeviceSelector({ value, onChange, disabled }: OutputDeviceSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [devices, setDevices] = useState<AudioOutputDevice[]>([]);
  const [sinkSupported, setSinkSupported] = useState(false);

  useEffect(() => {
    setSinkSupported(supportsSinkId());
    void listOutputDevices().then(setDevices);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        出力デバイスを読み込み中…
      </div>
    );
  }

  if (!sinkSupported) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        このブラウザでは出力デバイスの切り替えに対応していません。
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-muted">出力デバイス</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </label>
  );
}
