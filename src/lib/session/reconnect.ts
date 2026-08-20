export function parseDurationToMs(duration?: string): number {
  if (!duration) return 0;
  const match = duration.match(/^(\d+(?:\.\d+)?)s$/);
  if (!match) return 0;
  return Math.max(0, parseFloat(match[1]) * 1000);
}

/** Reconnect slightly before the server closes the session. */
export function parseGoAwayDelay(timeLeft?: string): number {
  const remainingMs = parseDurationToMs(timeLeft);
  if (remainingMs <= 0) return 0;
  return Math.max(0, remainingMs - 3000);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function computeBackoffMs(attempt: number): number {
  return Math.min(8000, 500 * 2 ** attempt);
}
