import assert from "node:assert/strict";
import test from "node:test";
import { computeBackoffMs, parseDurationToMs, parseGoAwayDelay } from "./reconnect";

test("parseDurationToMs parses seconds duration", () => {
  assert.equal(parseDurationToMs("30s"), 30000);
  assert.equal(parseDurationToMs("1.5s"), 1500);
});

test("parseDurationToMs returns 0 for invalid values", () => {
  assert.equal(parseDurationToMs(undefined), 0);
  assert.equal(parseDurationToMs("invalid"), 0);
});

test("parseGoAwayDelay reconnects 3 seconds before expiry", () => {
  assert.equal(parseGoAwayDelay("30s"), 27000);
  assert.equal(parseGoAwayDelay("2s"), 0);
});

test("computeBackoffMs grows with attempts", () => {
  assert.equal(computeBackoffMs(0), 500);
  assert.equal(computeBackoffMs(1), 1000);
  assert.equal(computeBackoffMs(10), 8000);
});
