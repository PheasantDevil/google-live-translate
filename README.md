# google-live-translate

Google 翻訳アプリの **Live translate（リアルタイム翻訳）** 機能に相当する Web アプリケーション。

## 概要

マイクから入力された音声を Gemini Live API（`gemini-3.5-live-translate-preview`）でリアルタイムに翻訳し、翻訳音声をスピーカーまたはヘッドフォンで再生する。

## 技術スタック

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js Route Handlers（Ephemeral Token 発行）
- **AI**: Google Gemini Live API（音声→音声 同時通訳）
- **Hosting**: Vercel

## セットアップ

```bash
npm install
cp .env.example .env.local
# GEMINI_API_KEY_SERVER に Google AI Studio の API キーを設定
npm run dev
```

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Playwright E2E |
| `npm run test:unit` | ユニットテスト |

## 設計書

- ローカル: [docs/design.html](./docs/design.html)
- デプロイ後: `/docs/design.html`

## 環境変数

| 変数 | 説明 |
|------|------|
| `GEMINI_API_KEY_SERVER` | サーバー専用 API キー（Ephemeral Token 発行） |
| `DEFAULT_TARGET_LANGUAGE` | デフォルト翻訳先言語（BCP-47、例: `ja`） |

## デプロイ

Vercel プロジェクト: `google-live-translate`

Production URL: https://google-live-translate.vercel.app

## ライセンス

Private — PheasantDevil
