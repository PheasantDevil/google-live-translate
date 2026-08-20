import type { ApiErrorResponse } from "@/lib/api/errors";

export interface LiveTokenResponse {
  token: string;
  expiresAt: string;
}

export async function fetchLiveToken(targetLanguage: string): Promise<LiveTokenResponse> {
  const response = await fetch("/api/live-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetLanguage }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(
      payload?.error ?? "翻訳セッションの開始に失敗しました。しばらくしてから再度お試しください。",
    );
  }

  return response.json() as Promise<LiveTokenResponse>;
}
