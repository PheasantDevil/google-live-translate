import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_TARGET_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLanguageName,
  isSupportedLanguage,
} from "../constants/languages";

test("isSupportedLanguage validates known codes", () => {
  assert.equal(isSupportedLanguage("ja"), true);
  assert.equal(isSupportedLanguage("xx"), false);
});

test("getLanguageName returns localized label", () => {
  assert.equal(getLanguageName("ja"), "日本語");
  assert.equal(getLanguageName("unknown"), "unknown");
});

test("default target language is Japanese", () => {
  assert.equal(DEFAULT_TARGET_LANGUAGE, "ja");
  assert.ok(SUPPORTED_LANGUAGES.some((lang) => lang.code === "ja"));
});
