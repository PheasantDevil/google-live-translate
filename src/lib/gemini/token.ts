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
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "トークンの取得に失敗しました");
  }

  return response.json() as Promise<LiveTokenResponse>;
}
