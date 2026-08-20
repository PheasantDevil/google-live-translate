import { GoogleGenAI, Modality, type LiveConnectConfig } from "@google/genai/node";
import { NextRequest, NextResponse } from "next/server";
import { API_ERROR_CODES, createApiError } from "@/lib/api/errors";
import {
  DEFAULT_TARGET_LANGUAGE,
  GEMINI_LIVE_TRANSLATE_MODEL,
  isSupportedLanguage,
} from "@/lib/constants/languages";

function getApiKey(): string {
  return process.env.GEMINI_API_KEY_SERVER ?? process.env.GEMINI_API_KEY ?? "";
}

export async function POST(request: NextRequest) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("[live-token] GEMINI_API_KEY_SERVER is not configured");
    return createApiError(API_ERROR_CODES.SERVICE_UNAVAILABLE, 503);
  }

  let targetLanguage = DEFAULT_TARGET_LANGUAGE;
  try {
    const body = (await request.json()) as { targetLanguage?: string };
    if (body.targetLanguage) {
      if (!isSupportedLanguage(body.targetLanguage)) {
        return createApiError(API_ERROR_CODES.INVALID_LANGUAGE, 400);
      }
      targetLanguage = body.targetLanguage;
    }
  } catch {
    // Empty body is acceptable; fall back to default language.
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const liveConfig = {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      translationConfig: {
        targetLanguageCode: targetLanguage,
        echoTargetLanguage: false,
      },
    } as LiveConnectConfig;

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        liveConnectConstraints: {
          model: GEMINI_LIVE_TRANSLATE_MODEL,
          config: liveConfig,
        },
        httpOptions: { apiVersion: "v1alpha" },
      },
    });

    if (!token.name) {
      console.error("[live-token] Token response did not include a name");
      return createApiError(API_ERROR_CODES.TOKEN_FAILED, 500);
    }

    return NextResponse.json({
      token: token.name,
      expiresAt: expireTime,
    });
  } catch (error) {
    console.error("[live-token] Failed to create ephemeral token:", error);
    return createApiError(API_ERROR_CODES.TOKEN_FAILED, 500);
  }
}
