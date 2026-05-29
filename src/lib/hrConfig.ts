// 人事フォーム用: 会社別スプシ (input1 / input2) から取得する設定の型と取得関数。
// 本番ではGAS API経由でスプシの内容を返すが、まずはモックで動作確認する。

export type Department = {
  slot: string; // "A", "B", ..., "T"
  name: string; // 部署名 (例: "財務")
};

export type SurveyPeriod = {
  round: number; // 1, 2, 3, 4
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
};

export type CompanyConfig = {
  companyId: string;
  companyName?: string;
  departments: Department[];
  periods: SurveyPeriod[];
};

// A001 (会社A) の現状を模したモックデータ。
// クライアント返答前なので、現在の input2 / input1 の値をそのまま反映している。
const MOCK_CONFIGS: Record<string, CompanyConfig> = {
  A001: {
    companyId: "A001",
    departments: [
      { slot: "A", name: "財務" },
      { slot: "D", name: "技術" },
      { slot: "F", name: "販売促進" },
      { slot: "H", name: "マーケティング" },
      { slot: "K", name: "広報" },
      { slot: "T", name: "営業" },
    ],
    periods: [
      { round: 1, startDate: "2024-10-08", endDate: "2024-11-05" },
      { round: 2, startDate: "2024-11-06", endDate: "2024-11-15" },
    ],
  },
};

export const getCompanyConfig = async (
  companyId: string
): Promise<CompanyConfig | null> => {
  // TODO: クライアント確認後、GAS API (action=get_company_config) に置き換える
  await new Promise((r) => setTimeout(r, 200)); // 通信遅延の擬似
  return MOCK_CONFIGS[companyId] ?? null;
};

// surveyDate ("YYYY-MM-DD") が periods のどの回に該当するかを返す。
// どの回にも該当しない場合は null。期間が重複している場合は早い回を優先。
export const getRoundFromDate = (
  surveyDate: string,
  periods: SurveyPeriod[]
): number | null => {
  if (!surveyDate) return null;
  const sorted = [...periods].sort((a, b) => a.round - b.round);
  for (const p of sorted) {
    if (surveyDate >= p.startDate && surveyDate <= p.endDate) {
      return p.round;
    }
  }
  return null;
};
