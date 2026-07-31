// 人事フォーム用: 会社別スプシ (input1 / input2) の設定をGAS API経由で取得する。
//
// 設計方針（クライアント承認済み・2026-06-11）:
// - 部署リストは会社ごとに input2 のD列から動的取得（案B）
// - 人事フォームから新規部署を追加した場合、GAS側で input2 のD列の空きスロットに書き込む
// - スロット記号（A〜T）はGAS内部で管理。フロントは部署名のみ扱う

import { GAS_ENDPOINT_URL } from "@/constants/form";

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

// GAS API 共通呼び出し: ?data=<JSON> 形式
// 成功時は result.data を返し、失敗時は null を返す
const callGasApi = async <T>(
  payload: Record<string, string>
): Promise<T | null> => {
  if (!GAS_ENDPOINT_URL) return null;
  try {
    const url = `${GAS_ENDPOINT_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
    const response = await fetch(url);
    const result = await response.json();
    if (result.status !== "ok") return null;
    return result.data as T;
  } catch (error) {
    console.error("GAS API error:", error);
    return null;
  }
};

export const getCompanyConfig = async (
  companyId: string
): Promise<CompanyConfig | null> => {
  return await callGasApi<CompanyConfig>({
    action: "get_company_config",
    company_id: companyId,
  });
};

// アセスメントフォーム用: 部署名の配列のみ返す軽量版
export const getCompanyDepartments = async (
  companyId: string
): Promise<string[] | null> => {
  const data = await callGasApi<{ departments: string[] }>({
    action: "get_departments",
    company_id: companyId,
  });
  return data ? data.departments : null;
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
// 現在期間内 → その回のendDate、期間外 → 直近未来の回のendDate、それもなければ null
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
