export const API_ERROR_CODES = {
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  INVALID_LANGUAGE: "INVALID_LANGUAGE",
  TOKEN_FAILED: "TOKEN_FAILED",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export const USER_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  [API_ERROR_CODES.SERVICE_UNAVAILABLE]:
    "翻訳サービスを現在ご利用いただけません。しばらくしてから再度お試しください。",
  [API_ERROR_CODES.INVALID_LANGUAGE]: "選択された言語はサポートされていません。",
  [API_ERROR_CODES.TOKEN_FAILED]:
    "翻訳セッションの開始に失敗しました。しばらくしてから再度お試しください。",
};

export interface ApiErrorResponse {
  error: string;
  code: ApiErrorCode;
}

export function createApiError(code: ApiErrorCode, status: number): Response {
  return Response.json({ error: USER_ERROR_MESSAGES[code], code } satisfies ApiErrorResponse, {
    status,
  });
}
