"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FORM_ENTRY_IDS } from "@/constants/form";
import { submitToGoogleForm } from "@/lib/googleForm";

// 属性の選択肢（Googleフォームと完全一致させる）
const ROLE_OPTIONS = [
  "経営層（役員・CxOなど）",
  "管理職（係長・課長・部長など）",
  "一般社員",
];

const DEPARTMENT_OPTIONS = [
  "総務", "人事", "法務", "経理", "財務",
  "マーケティング", "宣伝", "広報", "販売促進",
  "営業", "技術", "秘書", "その他",
];

// セクションと設問の定義
type Question = {
  id: string;
  label: string;
};

type Section = {
  title: string;
  questions: Question[];
};

const SECTIONS: Section[] = [
  {
    title: "1. 多様性の尊重",
    questions: [
      { id: "M-1-1", label: "所属部署は、【人種・性別・年代】など多様な人材が集まっている" },
      { id: "M-1-2", label: "所属部署は、【業種・バックグラウンド・スキル・価値観】など多様な人材が集まっている" },
      { id: "M-1-3", label: "所属部署は、多様な人材や価値観を歓迎し許容している" },
      { id: "M-1-4", label: "自分は、組織に受け入れられ、かつ、自分も組織に対して愛着がある" },
      { id: "M-1-5", label: "所属部署では、マイノリティ（少数派）の従業員も尊重されている" },
      { id: "M-1-6", label: "所属部署では、多様性や無意識の偏見に関して学ぶ機会がある" },
      { id: "M-1-7", label: "所属部署は、多様な働き方に対応できるツールやシステムが整備されている" },
      { id: "M-1-8", label: "所属部署は、環境を問わない多様な働き方に対応できる人事制度が整備されている" },
      { id: "M-1-9", label: "自分は、職場で多様な経験をしたり、視野を広げている" },
      { id: "M-1-10", label: "所属部署では、定期的な部署異動を推奨している" },
    ],
  },
];

// 5段階評価の選択肢
const SCALE_OPTIONS = [
  { value: "1", label: "全くそう思わない" },
  { value: "2", label: "あまりそう思わない" },
  { value: "3", label: "どちらともいえない" },
  { value: "4", label: "ややそう思う" },
  { value: "5", label: "とてもそう思う" },
];

export default function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = SECTIONS.length + 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const setAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const formData: Record<string, string> = {
      company_id: "A001",
      company_name: "テスト",
    };

    Object.entries(answers).forEach(([key, value]) => {
      const entryId = FORM_ENTRY_IDS[key as keyof typeof FORM_ENTRY_IDS];
      if (entryId) {
        formData[entryId] = value;
      }
    });

    const success = await submitToGoogleForm(formData);
    setIsSubmitting(false);

    if (success) {
      alert("ご回答ありがとうございました！");
    } else {
      alert("送信に失敗しました。もう一度お試しください。");
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー: タイトルエリア */}
      <header className="border-t border-gray-300 pt-16 pb-12 px-6 md:px-16 lg:px-24">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
          ASSESSMENT
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          組織課題アセスメント
        </p>
        <div className="mt-10 max-w-2xl">
          <p className="text-gray-700 leading-relaxed">
            イノベーションを生み出す組織の課題と現状を把握するアセスメントです。
          </p>
          <p className="text-gray-700 leading-relaxed">
            各項目について、最も当てはまるものをお選びください。
          </p>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="px-6 md:px-16 lg:px-24 pb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>STEP {currentStep + 1} / {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-[2px]" />
      </div>

      {/* フォームエリア */}
      <div className="flex-1 px-6 md:px-16 lg:px-24 py-12">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 md:p-12">

          {/* ステップ0: 属性選択 */}
          {currentStep === 0 && (
            <div className="space-y-10">
              <h2 className="text-xl font-semibold text-gray-900">
                あなたについて教えてください
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-900">属性選択</Label>
                  <span className="text-xs text-orange-500 font-medium">必須</span>
                </div>
                <Select
                  value={answers["role"] || ""}
                  onValueChange={(value) => setAnswer("role", value)}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 rounded-lg h-12 text-sm">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-900">所属部署</Label>
                  <span className="text-xs text-orange-500 font-medium">必須</span>
                </div>
                <Select
                  value={answers["department"] || ""}
                  onValueChange={(value) => setAnswer("department", value)}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 rounded-lg h-12 text-sm">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* ステップ1〜: 各セクションの設問 */}
          {currentStep > 0 && currentStep <= SECTIONS.length && (
            <div className="space-y-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {SECTIONS[currentStep - 1].title}
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  各項目について、最も当てはまるものを選んでください
                </p>
              </div>

              <div className="space-y-10">
                {SECTIONS[currentStep - 1].questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-xl border border-gray-100 p-6 space-y-4"
                  >
                    <Label className="text-sm leading-relaxed text-gray-800 block">
                      <span className="text-gray-400 mr-2">Q{index + 1}</span>
                      {question.label}
                    </Label>
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={(value) => setAnswer(question.id, value)}
                      className="flex gap-2 pt-2"
                    >
                      {SCALE_OPTIONS.map((option) => (
                        <div key={option.value} className="flex-1">
                          <RadioGroupItem
                            value={option.value}
                            id={`${question.id}-${option.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${question.id}-${option.value}`}
                            className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100 peer-data-[state=checked]:border-gray-900 peer-data-[state=checked]:bg-gray-900 peer-data-[state=checked]:text-white cursor-pointer transition-all text-center"
                          >
                            <span className="text-base font-semibold">{option.value}</span>
                            <span className="text-[10px] leading-tight opacity-70">
                              {option.label}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-gray-500 hover:text-gray-900"
            >
              ← 戻る
            </Button>

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 h-11"
              >
                {isSubmitting ? "送信中..." : "送信する →"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 h-11"
              >
                次へ →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
