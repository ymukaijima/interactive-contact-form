"use client";

import React from "react";
import { submitToGoogleForm } from "@/lib/googleForm";
import { FORM_ENTRY_IDS } from "@/constants/form";

export const TestForm = () => {
  const handleTestSubmit = async () => {
    // テスト送信するデータ（住所録のIDを使います）
    const testData: Record<string, string> = {
      [FORM_ENTRY_IDS.role]: "経営層（役員・CxOなど）",
      [FORM_ENTRY_IDS.department]: "総務",
      [FORM_ENTRY_IDS["M-1-1"]]: "3",
    };

    console.log("送信開始...");
    const success = await submitToGoogleForm(testData);

    if (success) {
      alert("スプレッドシートを見てください！データが届いているはずです。");
    } else {
      alert("送信失敗...コンソールを確認してください。");
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc" }}>
      <h2>開発用：疎通テストボタン</h2>
      <p>
        このボタンを押すと、Googleスプレッドシートにテストデータが飛びます。
      </p>
      <button
        onClick={handleTestSubmit}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        テスト送信を実行
      </button>
    </div>
  );
};
