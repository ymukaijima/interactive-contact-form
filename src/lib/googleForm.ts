// src/lib/googleForm.ts
// [DEMO MODE] Mocked for portfolio. See main branch for the real implementation.
// [DEMO MODE] このファイルはポートフォリオ用にモック化されています。本番実装は main ブランチ参照。

/**
 * [DEMO] Does not actually submit. Simulates a successful response after 500ms.
 * [DEMO] 実際には送信せず、500ms待って成功レスポンスを返す
 */
export const submitToGoogleForm = async (
  _data: Record<string, string>
): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
};
