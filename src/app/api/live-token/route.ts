import { GoogleGenAI, Modality, type LiveConnectConfig } from "@google/genai/node";
import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json(
      { error: "GEMINI_API_KEY_SERVER が設定されていません" },
      { status: 500 },
    );
  }

  let targetLanguage = DEFAULT_TARGET_LANGUAGE;
  try {
    const body = (await request.json()) as { targetLanguage?: string };
    if (body.targetLanguage) {
      if (!isSupportedLanguage(body.targetLanguage)) {
        return NextResponse.json({ error: "サポートされていない言語コードです" }, { status: 400 });
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
      return NextResponse.json({ error: "トークンの生成に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      token: token.name,
      expiresAt: expireTime,
    });
  } catch (error) {
    console.error("Failed to create ephemeral token:", error);
    return NextResponse.json({ error: "トークンの生成に失敗しました" }, { status: 500 });
  }
}
