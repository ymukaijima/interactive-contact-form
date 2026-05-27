"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DEPARTMENT_OPTIONS, ROLE_OPTIONS } from "@/constants/questions";
import { submitToGoogleForm } from "@/lib/googleForm";

const cellKey = (dept: string, role: string) => `${dept}__${role}`;
const roleShortLabel = (role: string) => role.replace(/（.*?）/, "");

export default function HRForm() {
  const formTopRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company") || "";

  const [surveyDate, setSurveyDate] = useState("");
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
  const [dateInvalid, setDateInvalid] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const setCount = (dept: string, role: string, value: string) => {
    const key = cellKey(dept, role);
    setCounts((prev) => ({ ...prev, [key]: value }));
    if (invalidCells.has(key)) {
      const next = new Set(invalidCells);
      next.delete(key);
      setInvalidCells(next);
      if (next.size === 0 && !dateInvalid) setValidationError("");
    }
  };

  const validate = (): boolean => {
    const invalid = new Set<string>();
    const dateMissing = !surveyDate;
    let hasPositive = false;

    for (const dept of DEPARTMENT_OPTIONS) {
      for (const role of ROLE_OPTIONS) {
        const key = cellKey(dept, role);
        const v = counts[key];
        if (v === undefined || v === "") continue; // 空欄は 0 扱い
        const n = Number(v);
        if (Number.isNaN(n) || n < 0 || !Number.isInteger(n)) {
          invalid.add(key);
        } else if (n > 0) {
          hasPositive = true;
        }
      }
    }

    setInvalidCells(invalid);
    setDateInvalid(dateMissing);

    if (invalid.size > 0) {
      setValidationError(
        `不正な値が${invalid.size}件あります。0以上の整数を入力してください。${
          dateMissing ? "また、調査日も入力してください。" : ""
        }`
      );
      return false;
    }
    if (dateMissing && !hasPositive) {
      setValidationError("調査日と、少なくとも1マスに1以上の人数を入力してください。");
      return false;
    }
    if (dateMissing) {
      setValidationError("調査日を入力してください。");
      return false;
    }
    if (!hasPositive) {
      setValidationError("少なくとも1マスに1以上の人数を入力してください。");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmitClick = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setIsCompleted(true);

    const formData: Record<string, string> = {
      form_type: "hr_headcount",
      company_id: companyId,
      survey_date: surveyDate,
    };
    for (const dept of DEPARTMENT_OPTIONS) {
      for (const role of ROLE_OPTIONS) {
        const key = cellKey(dept, role);
        formData[key] = String(Number(counts[key] ?? 0));
      }
    }

    const success = await submitToGoogleForm(formData);
    if (!success) {
      setIsCompleted(false);
      setSubmitError(true);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-12 md:p-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
            THANK YOU
          </h1>
          <p className="text-sm text-gray-500 mt-3">人員数を登録しました</p>
          <div className="mt-8">
            <p className="text-base text-gray-700 leading-relaxed">
              ご登録いただいた内容は、
              <br />
              アセスメントの回答率算出に使用されます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-8 py-12">
      <div
        ref={formTopRef}
        className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 md:p-14"
      >
        <header className="mb-10">
          <h1 className="text-[clamp(1.25rem,4vw,2.25rem)] font-bold tracking-tight text-gray-900 text-center">
            人員数の登録
          </h1>
          <p className="text-sm text-gray-700 leading-relaxed mt-6 text-center">
            アセスメント調査時点での部署×役職ごとの人員数をご登録ください。
            <br />
            この情報は、回答率（回答数÷在籍人数）の算出に使用されます。
          </p>
          <p className="text-xs text-gray-500 mt-4 text-center">
            会社ID: {companyId || "（未指定）"}
          </p>
        </header>

        <div className="space-y-10">
          {/* 調査日 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium text-gray-900">調査日</Label>
              <span className="text-xs text-orange-500 font-medium">必須</span>
            </div>
            <input
              type="date"
              value={surveyDate}
              onChange={(e) => {
                setSurveyDate(e.target.value);
                if (e.target.value) {
                  setDateInvalid(false);
                  if (invalidCells.size === 0) setValidationError("");
                }
              }}
              className={`w-full bg-white border rounded-lg h-12 px-3 text-base focus:outline-none focus:border-gray-400 ${
                dateInvalid ? "border-red-300" : "border-gray-200"
              }`}
            />
            <p className="text-xs text-gray-500">
              人員数を確定させる基準日です（通常はアセスメント実施日と同日）。
            </p>
          </div>

          {/* 部署×役職テーブル */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium text-gray-900">
                部署×役職別の人員数
              </Label>
              <span className="text-xs text-orange-500 font-medium">必須</span>
            </div>
            <p className="text-xs text-gray-500">
              在籍人数を入力してください。空欄のマスは 0 として扱われます。
            </p>

            <div className="overflow-x-auto -mx-2 sm:mx-0 pb-2">
              <table className="w-full min-w-[440px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs sm:text-sm font-medium text-gray-700 py-3 px-2 w-[28%]">
                      部署
                    </th>
                    {ROLE_OPTIONS.map((role) => (
                      <th
                        key={role}
                        className="text-center text-xs sm:text-sm font-medium text-gray-700 py-3 px-2"
                      >
                        {roleShortLabel(role)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <tr key={dept} className="border-b border-gray-100">
                      <td className="text-sm text-gray-800 py-2 px-2 whitespace-nowrap">
                        {dept}
                      </td>
                      {ROLE_OPTIONS.map((role) => {
                        const key = cellKey(dept, role);
                        const isInvalid = invalidCells.has(key);
                        return (
                          <td key={role} className="py-2 px-1">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              inputMode="numeric"
                              value={counts[key] ?? ""}
                              onChange={(e) => setCount(dept, role, e.target.value)}
                              className={`w-full text-center bg-white border rounded-lg px-2 py-2 text-base focus:outline-none focus:border-gray-400 ${
                                isInvalid ? "border-red-300" : "border-gray-200"
                              }`}
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* バリデーションエラー */}
          {validationError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {validationError}
            </div>
          )}

          {/* 送信エラー */}
          {submitError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              送信に失敗しました。通信環境を確認の上、もう一度「送信する」を押してください。
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex justify-end mt-12 pt-8 border-t border-gray-200">
            <Button
              onClick={handleSubmitClick}
              className="bg-[#EB643C] hover:bg-[#d45835] text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg"
            >
              送信する →
            </Button>
          </div>
        </div>
      </div>

      {/* 送信確認ダイアログ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              登録内容を送信しますか？
            </h3>
            <p className="text-sm text-gray-500 mt-3 text-center">
              送信後は内容を変更できません。
              <br />
              内容をご確認の上、送信してください。
            </p>
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-full h-11"
              >
                戻る
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-[#EB643C] hover:bg-[#d45835] text-white rounded-full h-11"
              >
                送信する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
