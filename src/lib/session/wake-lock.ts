export class WakeLockManager {
  private sentinel: WakeLockSentinel | null = null;

  async acquire(): Promise<void> {
    if (!("wakeLock" in navigator)) return;

    try {
      this.sentinel = await navigator.wakeLock.request("screen");
    } catch {
      // Wake Lock may fail when the tab is not visible.
    }
  }

  async release(): Promise<void> {
    try {
      await this.sentinel?.release();
    } catch {
      // Ignore release errors.
    }
    this.sentinel = null;
  }
}
