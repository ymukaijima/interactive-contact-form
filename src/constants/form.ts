// Googleフォームの送信先URL（/viewform ではなく /formResponse にするのがコツです！）
export const GOOGLE_FORM_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfVXcmlrEywbqGmaPZCm8vSaytPV86W8QHiF5CcEIqcJg2JbA/formResponse";

// 先ほど抜き出したIDの住所録
export const FORM_ENTRY_IDS = {
  role: "entry.1439250062", // 属性（経営層など）
  department: "entry.1118212117", // 所属部署
  q1: "entry.865384802", // 設問1
  q2: "entry.980244749", // 設問2
  q3: "entry.617635493",
  q4: "entry.5764233",
  q5: "entry.880403936",
  q6: "entry.50336592",
  q7: "entry.839772240",
  q8: "entry.2034550658",
  q9: "entry.1708202126",
  q10: "entry.750741378",
  // ここから先（58個分）は、私が後でリスト化しておくので
  // 今夜は「こんな感じで並ぶんだな」とイメージするだけで100点です！
};
