"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ROLE_OPTIONS } from "@/constants/questions";
import { submitToGoogleForm } from "@/lib/googleForm";
import {
  getCompanyConfig,
  getRoundFromDate,
  type CompanyConfig,
} from "@/lib/hrConfig";

// 既存部署のセルキー: 部署名 + 役職（部署名はスプシで一意）
const existingCellKey = (deptName: string, role: string) =>
  `${deptName}__${role}`;
const roleShortLabel = (role: string) => role.replace(/（.*?）/, "");

// 全角数字 → 半角数字に変換し、数字以外は除去
const normalizeNumberInput = (value: string) =>
  value
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, "");

// 新規追加する部署の行
type NewDept = {
  id: string; // フロント内部のローカルID（送信時には使わない）
  name: string;
  counts: Record<string, string>; // role -> 数値文字列
};

// 簡易ID生成（crypto.randomUUID 未対応環境のフォールバック）
const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

export default function HRForm() {
  const formTopRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company") || "";

  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(!!companyId);
  const [configError, setConfigError] = useState(
    !companyId ? "会社IDが指定されていません。URLをご確認ください。" : ""
  );

  const [surveyDate, setSurveyDate] = useState("");
  // 既存部署の人数: key = `${deptName}__${role}`
  const [counts, setCounts] = useState<Record<string, string>>({});
  // 新規追加する部署リスト
  const [newDepts, setNewDepts] = useState<NewDept[]>([]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
  const [invalidNewDeptNames, setInvalidNewDeptNames] = useState<Set<string>>(
    new Set()
  );
  const [dateInvalid, setDateInvalid] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    getCompanyConfig(companyId)
      .then((c) => {
        if (cancelled) return;
        if (!c) {
          setConfigError(
            `会社ID「${companyId}」の設定が見つかりません。担当者にご確認ください。`
          );
        } else {
          setConfig(c);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setConfigError(
          "設定の取得に失敗しました。通信環境をご確認の上、ページを再読み込みしてください。"
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingConfig(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const detectedRound = config
    ? getRoundFromDate(surveyDate, config.periods)
    : null;

  const clearErrorIfAllValid = (
    nextInvalidCells: Set<string>,
    nextInvalidNames: Set<string>,
    nextDateInvalid: boolean
  ) => {
    if (
      nextInvalidCells.size === 0 &&
      nextInvalidNames.size === 0 &&
      !nextDateInvalid
    ) {
      setValidationError("");
    }
  };

  const setExistingCount = (deptName: string, role: string, value: string) => {
    const key = existingCellKey(deptName, role);
    const normalized = normalizeNumberInput(value);
    setCounts((prev) => ({ ...prev, [key]: normalized }));
    if (invalidCells.has(key)) {
      const next = new Set(invalidCells);
      next.delete(key);
      setInvalidCells(next);
      clearErrorIfAllValid(next, invalidNewDeptNames, dateInvalid);
    }
  };

  const setNewDeptName = (id: string, name: string) => {
    setNewDepts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name } : d))
    );
    if (invalidNewDeptNames.has(id)) {
      const next = new Set(invalidNewDeptNames);
      next.delete(id);
      setInvalidNewDeptNames(next);
      clearErrorIfAllValid(invalidCells, next, dateInvalid);
    }
  };

  const setNewDeptCount = (id: string, role: string, value: string) => {
    const normalized = normalizeNumberInput(value);
    setNewDepts((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, counts: { ...d.counts, [role]: normalized } }
          : d
      )
    );
    const cellKey = `${id}__${role}`;
    if (invalidCells.has(cellKey)) {
      const next = new Set(invalidCells);
      next.delete(cellKey);
      setInvalidCells(next);
      clearErrorIfAllValid(next, invalidNewDeptNames, dateInvalid);
    }
  };

  const addNewDept = () => {
    setNewDepts((prev) => [
      ...prev,
      { id: genId(), name: "", counts: {} },
    ]);
  };

  const removeNewDept = (id: string) => {
    setNewDepts((prev) => prev.filter((d) => d.id !== id));
    // 当該部署に紐づくinvalidをクリーンアップ
    const nextInvalidNames = new Set(invalidNewDeptNames);
    nextInvalidNames.delete(id);
    setInvalidNewDeptNames(nextInvalidNames);

    const nextInvalidCells = new Set(invalidCells);
    for (const role of ROLE_OPTIONS) {
      nextInvalidCells.delete(`${id}__${role}`);
    }
    setInvalidCells(nextInvalidCells);
    clearErrorIfAllValid(nextInvalidCells, nextInvalidNames, dateInvalid);
  };

  const validate = (): boolean => {
    if (!config) return false;

    const invalidCellsNext = new Set<string>();
    const invalidNamesNext = new Set<string>();
    const dateMissing = !surveyDate;

    // 既存部署の人数チェック
    for (const dept of config.departments) {
      for (const role of ROLE_OPTIONS) {
        const key = existingCellKey(dept.name, role);
        const v = counts[key];
        if (v === undefined || v === "") continue;
        const n = Number(v);
        if (Number.isNaN(n) || n < 0 || !Number.isInteger(n)) {
          invalidCellsNext.add(key);
        }
      }
    }

    // 新規部署の人数チェック + 名前チェック
    const trimmedNewNames = newDepts.map((d) => d.name.trim());
    for (let i = 0; i < newDepts.length; i++) {
      const d = newDepts[i];
      const trimmedName = trimmedNewNames[i];

      // 名前の空欄チェック
      if (!trimmedName) {
        invalidNamesNext.add(d.id);
      }

      // 人数チェック
      for (const role of ROLE_OPTIONS) {
        const v = d.counts[role];
        if (v === undefined || v === "") continue;
        const n = Number(v);
        if (Number.isNaN(n) || n < 0 || !Number.isInteger(n)) {
          invalidCellsNext.add(`${d.id}__${role}`);
        }
      }
    }

    // 部署名重複チェック（既存 + 新規）
    const existingNames = new Set(config.departments.map((d) => d.name));
    const newNameCount = new Map<string, string[]>(); // name -> ids
    for (let i = 0; i < newDepts.length; i++) {
      const trimmedName = trimmedNewNames[i];
      if (!trimmedName) continue;
      if (existingNames.has(trimmedName)) {
        invalidNamesNext.add(newDepts[i].id);
      }
      const arr = newNameCount.get(trimmedName) ?? [];
      arr.push(newDepts[i].id);
      newNameCount.set(trimmedName, arr);
    }
    for (const ids of newNameCount.values()) {
      if (ids.length > 1) {
        for (const id of ids) invalidNamesNext.add(id);
      }
    }

    setInvalidCells(invalidCellsNext);
    setInvalidNewDeptNames(invalidNamesNext);
    setDateInvalid(dateMissing);

    // エラーメッセージ組み立て
    const messages: string[] = [];
    if (invalidNamesNext.size > 0) {
      messages.push(
        "部署名に問題があります（空欄、または既存部署と重複、または新規部署同士で重複しています）。"
      );
    }
    if (invalidCellsNext.size > 0) {
      messages.push("人員数は0以上の整数を入力してください。");
    }
    if (dateMissing) {
      messages.push("調査日を入力してください。");
    }

    // 部署0件チェック
    if (config.departments.length === 0 && newDepts.length === 0) {
      messages.push(
        "部署が登録されていません。「+ 部署を追加」から部署を追加してください。"
      );
    }

    if (messages.length > 0) {
      setValidationError(messages.join(" "));
      return false;
    }

    if (detectedRound === null) {
      setValidationError(
        "調査日がアセスメント実施期間外です。期間内の日付を指定してください。"
      );
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
    if (!config || detectedRound === null) return;
    setShowConfirm(false);
    setIsCompleted(true);

    // 送信データ: 既存部署 + 新規部署を統一フォーマットで送る
    const departments = [
      ...config.departments.map((d) => ({
        name: d.name,
        isNew: false,
        counts: ROLE_OPTIONS.reduce<Record<string, number>>((acc, role) => {
          const v = counts[existingCellKey(d.name, role)];
          acc[role] = v ? Number(v) : 0;
          return acc;
        }, {}),
      })),
      ...newDepts.map((d) => ({
        name: d.name.trim(),
        isNew: true,
        counts: ROLE_OPTIONS.reduce<Record<string, number>>((acc, role) => {
          const v = d.counts[role];
          acc[role] = v ? Number(v) : 0;
          return acc;
        }, {}),
      })),
    ];

    const formData: Record<string, string> = {
      form_type: "hr_headcount",
      company_id: companyId,
      survey_date: surveyDate,
      round: String(detectedRound),
      departments: JSON.stringify(departments),
    };

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
            人事ご担当者さまへ
            <br />
            アセスメント調査時点での部署×役職ごとの人員数をご登録ください。
            <br />
            この情報は、回答率（回答数÷在籍人数）の算出に使用されます。
          </p>
          <p className="text-xs text-gray-500 mt-4 text-center">
            ※正社員のみ。休職中の方は除く。
          </p>
          <p className="text-xs text-gray-500 mt-1 text-center">
            会社ID: {companyId || "（未指定）"}
          </p>
        </header>

        {isLoadingConfig && (
          <div className="py-10 text-center text-sm text-gray-500">
            設定を読み込んでいます...
          </div>
        )}

        {!isLoadingConfig && configError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {configError}
          </div>
        )}

        {!isLoadingConfig && !configError && config && (
          <div className="space-y-10">
            {/* 調査日 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium text-gray-900">
                  調査日
                </Label>
                <span className="text-xs text-orange-500 font-medium">必須</span>
              </div>
              <input
                type="date"
                value={surveyDate}
                onChange={(e) => {
                  setSurveyDate(e.target.value);
                  if (e.target.value) {
                    setDateInvalid(false);
                    clearErrorIfAllValid(
                      invalidCells,
                      invalidNewDeptNames,
                      false
                    );
                  }
                }}
                className={`w-full bg-white border rounded-lg h-12 px-3 text-base focus:outline-none focus:border-gray-400 ${
                  dateInvalid ? "border-red-300" : "border-gray-200"
                }`}
              />
              <p className="text-xs text-gray-500">
                アセスメント実施期間内の日付を指定してください。
              </p>
              {surveyDate &&
                (detectedRound !== null ? (
                  <p className="text-xs text-green-700 font-medium">
                    この日付は <strong>{detectedRound}回目</strong> の
                    アセスメント期間に該当します。
                  </p>
                ) : (
                  <p className="text-xs text-red-600 font-medium">
                    ※この日付はどの回の実施期間にも含まれていません。
                  </p>
                ))}
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
              <p className="text-xs text-gray-500">
                ※既に登録済みの部署は変更・削除できません。訂正が必要な場合はお問い合わせください。
              </p>

              <div className="overflow-x-auto -mx-2 sm:mx-0 pb-2">
                <table className="w-full min-w-[480px]">
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
                      <th className="w-[40px]" />
                    </tr>
                  </thead>
                  <tbody>
                    {/* 既存部署 */}
                    {config.departments.map((dept) => (
                      <tr
                        key={`existing_${dept.name}`}
                        className="border-b border-gray-100"
                      >
                        <td className="text-sm text-gray-800 py-2 px-2 whitespace-nowrap">
                          {dept.name}
                        </td>
                        {ROLE_OPTIONS.map((role) => {
                          const key = existingCellKey(dept.name, role);
                          const isInvalid = invalidCells.has(key);
                          return (
                            <td key={role} className="py-2 px-1">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={counts[key] ?? ""}
                                onChange={(e) =>
                                  setExistingCount(
                                    dept.name,
                                    role,
                                    e.target.value
                                  )
                                }
                                className={`w-full text-center bg-white border rounded-lg px-2 py-2 text-base focus:outline-none focus:border-gray-400 ${
                                  isInvalid
                                    ? "border-red-300"
                                    : "border-gray-200"
                                }`}
                                placeholder="0"
                              />
                            </td>
                          );
                        })}
                        <td />
                      </tr>
                    ))}

                    {/* 新規追加部署 */}
                    {newDepts.map((d) => {
                      const nameInvalid = invalidNewDeptNames.has(d.id);
                      return (
                        <tr
                          key={`new_${d.id}`}
                          className="border-b border-gray-100 bg-amber-50/40"
                        >
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={d.name}
                              onChange={(e) =>
                                setNewDeptName(d.id, e.target.value)
                              }
                              placeholder="部署名を入力"
                              className={`w-full bg-white border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-gray-400 ${
                                nameInvalid
                                  ? "border-red-300"
                                  : "border-gray-200"
                              }`}
                            />
                          </td>
                          {ROLE_OPTIONS.map((role) => {
                            const cellKey = `${d.id}__${role}`;
                            const isInvalid = invalidCells.has(cellKey);
                            return (
                              <td key={role} className="py-2 px-1">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={d.counts[role] ?? ""}
                                  onChange={(e) =>
                                    setNewDeptCount(d.id, role, e.target.value)
                                  }
                                  className={`w-full text-center bg-white border rounded-lg px-2 py-2 text-base focus:outline-none focus:border-gray-400 ${
                                    isInvalid
                                      ? "border-red-300"
                                      : "border-gray-200"
                                  }`}
                                  placeholder="0"
                                />
                              </td>
                            );
                          })}
                          <td className="py-2 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => removeNewDept(d.id)}
                              className="text-gray-400 hover:text-red-500 text-lg leading-none"
                              aria-label={`${d.name || "新規部署"}を削除`}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 部署追加ボタン */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={addNewDept}
                  className="text-sm text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition-colors"
                >
                  ＋ 部署を追加
                </button>
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
        )}
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
