// src/lib/googleForm.ts
import { GOOGLE_FORM_ACTION_URL } from "@/constants/form";

/**
 * Reactのフォームデータを受け取り、Googleフォームのエンジンへ送信する関数
 */
export const submitToGoogleForm = async (data: Record<string, string>) => {
  const formData = new URLSearchParams();

  // データをGoogleフォームが理解できる形式に変換
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  try {
    // GoogleフォームへPOSTリクエストを送信
    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: "POST",
      mode: "no-cors", // Googleフォーム送信に必須の魔法の1行です
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    return true;
  } catch (error) {
    console.error("送信エラー:", error);
    return false;
  }
};
