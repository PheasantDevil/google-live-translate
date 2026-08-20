# google-live-translate

Google 翻訳アプリの **Live translate（リアルタイム翻訳）** 機能に相当する Web アプリケーション。

## 概要

マイクから入力された音声を Gemini Live API（`gemini-3.5-live-translate-preview`）でリアルタイムに翻訳し、翻訳音声をスピーカーまたはヘッドフォンで再生する。

## 設計書

実装設計書（HTML）:

- ローカル: [docs/design.html](./docs/design.html)
- デプロイ後: `/docs/design.html`

## 技術スタック（予定）

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js Route Handlers（Ephemeral Token 発行）
- **AI**: Google Gemini Live API（音声→音声 同時通訳）
- **Hosting**: Vercel

## 環境変数

`.env.example` を参照。Vercel ダッシュボードにも同値を設定すること。

| 変数 | 説明 |
|------|------|
| `GEMINI_API_KEY_SERVER` | サーバー専用 API キー（トークン発行用） |
| `DEFAULT_TARGET_LANGUAGE` | デフォルト翻訳先言語（BCP-47） |

## ステータス

🚧 **設計フェーズ** — 実装は設計書レビュー承認後に開始

## ライセンス

Private — PheasantDevil
