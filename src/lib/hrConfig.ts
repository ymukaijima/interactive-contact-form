// [DEMO MODE] Mocked for portfolio. See main branch for the real GAS API integration.
// [DEMO MODE] ポートフォリオ用にモック化。本番のGAS API連携は main ブランチ参照。

export type Department = {
  name: string;
};

export type SurveyPeriod = {
  round: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
};

export type CompanyConfig = {
  companyId: string;
  companyName?: string;
  departments: Department[];
  periods: SurveyPeriod[];
};

// Demo data returned to any companyId
// どの companyId でも同じデモデータを返す
const DEMO_CONFIG: CompanyConfig = {
  companyId: "DEMO",
  companyName: "Demo Company",
  departments: [
    { name: "営業" },
    { name: "マーケティング" },
    { name: "エンジニアリング" },
    { name: "人事" },
    { name: "経理" },
  ],
  periods: [
    // Cover a broad range so today is always inside a period during demos
    // デモ時に今日が期間内になるよう広く取っている
    { round: 1, startDate: "2020-01-01", endDate: "2099-12-31" },
  ],
};

export const getCompanyConfig = async (
  companyId: string
): Promise<CompanyConfig | null> => {
  await new Promise((r) => setTimeout(r, 200));
  return { ...DEMO_CONFIG, companyId: companyId || "DEMO" };
};

export const getCompanyDepartments = async (
  companyId: string
): Promise<string[] | null> => {
  const config = await getCompanyConfig(companyId);
  return config ? config.departments.map((d) => d.name) : null;
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

// アセスメントフォーム用: 現在該当する回のendDateを返す。
export const getActiveDeadline = (
  periods: SurveyPeriod[],
  today: string = new Date().toISOString().split("T")[0]
): string | null => {
  const sorted = [...periods].sort((a, b) => a.round - b.round);
  const current = sorted.find(
    (p) => today >= p.startDate && today <= p.endDate
  );
  if (current) return current.endDate;
  const upcoming = sorted.find((p) => today < p.startDate);
  return upcoming ? upcoming.endDate : null;
};

// "2024-11-15" → "11月15日"
export const formatDeadlineJP = (dateStr: string): string => {
  const [, month, day] = dateStr.split("-");
  return `${parseInt(month, 10)}月${parseInt(day, 10)}日`;
};
