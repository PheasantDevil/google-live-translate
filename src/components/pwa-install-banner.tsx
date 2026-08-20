"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || hidden) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
      <p className="text-sm">ホーム画面に追加して、アプリのように使えます。</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="rounded-full px-3 py-1 text-sm text-muted"
        >
          後で
        </button>
        <button
          type="button"
          onClick={() => {
            void deferredPrompt.prompt().then(() => setHidden(true));
          }}
          className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-white"
        >
          追加
        </button>
      </div>
    </div>
  );
}
