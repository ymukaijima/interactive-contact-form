// src/lib/googleForm.ts
import { GAS_ENDPOINT_URL } from "@/constants/form";

/**
 * Reactのフォームデータを受け取り、GAS経由でマスタースプレッドシートへ送信する関数
 */
export const submitToGoogleForm = async (data: Record<string, string>) => {
  try {
    // データをURLパラメータとして送信（GETリクエスト）
    const url = `${GAS_ENDPOINT_URL}?data=${encodeURIComponent(JSON.stringify(data))}`;

    const response = await fetch(url);
    const result = await response.json();
    return result.status === "ok";
  } catch (error) {
    console.error("送信エラー:", error);
    return false;
  }
};
