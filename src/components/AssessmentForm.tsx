"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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

import { FORM_ENTRY_IDS } from "@/constants/form";
import { submitToGoogleForm } from "@/lib/googleForm";
import {
  SECTIONS,
  ROLE_OPTIONS,
  DEPARTMENT_OPTIONS,
  SCALE_OPTIONS,
} from "@/constants/questions";

export default function AssessmentForm() {
  const formTopRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company") || "";
  const companyName = searchParams.get("name") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [unansweredIds, setUnansweredIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState(false);

  const activeSections = SECTIONS;
  const totalSteps = activeSections.length + 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const setAnswer = (key: string, value: string | null) => {
    if (!value) return;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    // 属性選択ページ: 両方選択済みならエラーを消す
    if (currentStep === 0) {
      if (newAnswers["role"] && newAnswers["department"]) {
        setValidationError("");
      }
    }

    // 設問ページ: 回答したらその設問のエラーを消す
    if (unansweredIds.includes(key)) {
      const remaining = unansweredIds.filter((id) => id !== key);
      setUnansweredIds(remaining);
      if (remaining.length === 0) {
        setValidationError("");
      }
    }

    // PCのみ: 次の設問へ自動スクロール
    if (currentStep > 0 && window.innerWidth >= 640) {
      const currentQuestions = activeSections[currentStep - 1].questions.filter(
        (q) => !q.executiveOnly || answers["role"] === "経営層（役員・CxOなど）",
      );
      const currentIndex = currentQuestions.findIndex((q) => q.id === key);
      if (currentIndex >= 0 && currentIndex < currentQuestions.length - 1) {
        const nextId = currentQuestions[currentIndex + 1].id;
        setTimeout(() => {
          document.getElementById(`question-${nextId}`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 200);
      }
    }
  };

  // 現在のセクションに未回答があるか検証し、エラー表示・スクロールまで行う
  // 戻り値: true=全回答済み, false=未回答あり
  const validateCurrentSection = (): boolean => {
    if (currentStep === 0 || currentStep > activeSections.length) return true;

    const unanswered = activeSections[currentStep - 1].questions
      .filter((q) => !q.executiveOnly || answers["role"] === "経営層（役員・CxOなど）")
      .filter((q) => !answers[q.id]);

    if (unanswered.length === 0) return true;

    const ids = unanswered.map((q) => q.id);
    setUnansweredIds(ids);
    setValidationError(`未回答の設問が${unanswered.length}件あります。すべての設問に回答してください。`);
    setTimeout(() => {
      document.getElementById(`question-${ids[0]}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
    return false;
  };

  const handleNext = () => {
    // バリデーション: ステップ0（属性選択）
    if (currentStep === 0) {
      if (!answers["role"] || !answers["department"]) {
        setValidationError("属性選択と所属部署を選択してください。");
        return;
      }
    }

    // バリデーション: セクション（設問）
    if (!validateCurrentSection()) return;

    setValidationError("");
    setUnansweredIds([]);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      formTopRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      formTopRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 送信ボタン押下時: バリデーション + 確認ダイアログ表示
  const handleSubmitClick = () => {
    if (!validateCurrentSection()) return;
    setValidationError("");
    setUnansweredIds([]);
    setShowConfirm(true);
  };

  // 確認ダイアログで「送信する」を押した時の処理
  const handleSubmit = async () => {
    setShowConfirm(false);
    setIsCompleted(true); // 楽観的に完了画面を表示

    const formData: Record<string, string> = {
      company_id: companyId,
      company_name: companyName,
    };

    Object.entries(answers).forEach(([key, value]) => {
      const entryId = FORM_ENTRY_IDS[key as keyof typeof FORM_ENTRY_IDS];
      if (entryId) {
        formData[entryId] = value;
      }
    });

    const success = await submitToGoogleForm(formData);
    if (!success) {
      // 送信失敗時は完了画面からエラー表示に切り替え
      setIsCompleted(false);
      setSubmitError(true);
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-12 md:p-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
            THANK YOU
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            ご回答ありがとうございました
          </p>
          <div className="mt-8">
            <p className="text-base text-gray-700 leading-relaxed">
              アセスメントの回答を受け付けました。
            </p>
            <p className="text-base text-gray-700 leading-relaxed mt-1">
              ご協力いただきありがとうございます。
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
        {/* ヘッダー: タイトルエリア */}
        <header className="mb-10">
          <h1 className="text-[clamp(1.25rem,4vw,2.25rem)] font-bold tracking-tight text-gray-900 text-center">
            「組織風土」と「働きがい」<br />に関する意識調査
          </h1>
          {currentStep === 0 && (
            <div className="mt-8 max-w-2xl mx-auto space-y-4">
              <h2 className="text-base font-semibold text-gray-900">
                【アンケートの目的】
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                日々の業務、いつも本当にお疲れ様です。
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                このアンケートは、私たちのチームや会社全体が現在どのような状態にあるか、皆さんが日頃感じている
                <span className="font-bold text-gray-900">「率直な実感」</span>
                を教えていただくためのものです。
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                変化の激しい環境の中で、私たち全員が無理なく、かつ「働きがい」を感じながら新しいことに「挑戦」していくためには、足元の環境（組織風土）が整っていることが何より大切だと考えています。
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                今の職場には、良い点もあれば、改善すべき点もあるはずです。皆さんの声をヒントに、無駄なストレスや忖度を減らし、全員が自然体で力を発揮できる
                <span className="font-bold text-gray-900">
                  「風通しの良い環境」
                </span>
                を一緒につくっていきたいと考えています。ご協力をお願いいたします。
              </p>

              <h2 className="text-base font-semibold text-gray-900 pt-2">
                【回答にあたってのお願い】
              </h2>
              <ul className="text-sm text-gray-700 leading-relaxed space-y-1">
                <li>
                  • 本アンケートは
                  <span className="font-bold text-gray-900">完全匿名</span>
                  です。誰が回答したか
                  <span className="font-bold text-gray-900">
                    特定されることはありません
                  </span>
                  。
                </li>
                <li>
                  • 個人の
                  <span className="font-bold text-gray-900">能力評価</span>や
                  <span className="font-bold text-gray-900">犯人探し</span>
                  ではありません。
                  <span className="font-bold text-gray-900">
                    「正解・不正解はありません」
                  </span>
                  。
                </li>
                <li>
                  • 会社としての
                  <span className="font-bold text-gray-900">
                    「建前ではなく」
                  </span>
                  、ご自身が感じている
                  <span className="font-bold text-gray-900">
                    「ありのまま」
                  </span>
                  を選択してください。
                </li>
              </ul>
              <p className="text-sm text-gray-700 font-bold">
                所要時間：約10〜15分
                <br />
                回答期限：◯月◯日
              </p>
            </div>
          )}
        </header>

        {/* プログレスバー */}
        <div className="mb-10">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>
              STEP {currentStep + 1} / {totalSteps}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-[2px]" />
        </div>

        <div>
          {/* ステップ0: 属性選択 */}
          {currentStep === 0 && (
            <div className="space-y-10">
              <h2 className="text-xl font-semibold text-gray-900">
                あなたについて教えてください
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium text-gray-900">
                    属性選択
                  </Label>
                  <span className="text-xs text-orange-500 font-medium">
                    必須
                  </span>
                </div>
                <Select
                  value={answers["role"] || ""}
                  onValueChange={(value) => setAnswer("role", value)}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 rounded-lg h-12 text-base">
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
                  <Label className="text-base font-medium text-gray-900">
                    所属部署
                  </Label>
                  <span className="text-xs text-orange-500 font-medium">
                    必須
                  </span>
                </div>
                <Select
                  value={answers["department"] || ""}
                  onValueChange={(value) => setAnswer("department", value)}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 rounded-lg h-12 text-base">
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
          {currentStep > 0 && currentStep <= activeSections.length && (
            <div className="space-y-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeSections[currentStep - 1].title}
                </h2>
                <p className="text-base text-gray-400 mt-2">
                  各項目について、最も当てはまるものを選んでください
                </p>
              </div>

              <div className="space-y-6">
                {activeSections[currentStep - 1].questions
                  .filter(
                    (q) =>
                      !q.executiveOnly ||
                      answers["role"] === "経営層（役員・CxOなど）",
                  )
                  .map((question, index) => (
                    <div
                      key={question.id}
                      id={`question-${question.id}`}
                      className={`bg-white rounded-xl border-2 p-6 space-y-4 shadow-sm ${
                        unansweredIds.includes(question.id)
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                    >
                      <Label className="text-base leading-relaxed text-gray-800 block">
                        <span className="text-gray-400 mr-2">Q{index + 1}</span>
                        {question.label}
                      </Label>
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-2 sm:hidden">
                          <span>全くそう思わない</span>
                          <span>とてもそう思う</span>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                          {SCALE_OPTIONS.map((option) => {
                            const isSelected =
                              answers[question.id] === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                  setAnswer(question.id, option.value)
                                }
                                className={`flex-1 flex flex-col items-center gap-2 rounded-xl border p-3 sm:p-4 cursor-pointer transition-all text-center ${
                                  isSelected
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-900"
                                }`}
                              >
                                <span className="text-base sm:text-lg font-semibold">
                                  {option.value}
                                </span>
                                <span className="hidden sm:block text-xs leading-tight opacity-70">
                                  {option.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {unansweredIds.includes(question.id) && (
                        <p className="text-xs text-red-500">この設問に回答してください</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

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
                onClick={handleSubmitClick}
                className="bg-[#EB643C] hover:bg-[#d45835] text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg"
              >
                送信する →
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

      {/* 送信確認ダイアログ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              回答を送信しますか？
            </h3>
            <p className="text-sm text-gray-500 mt-3 text-center">
              送信後は回答を変更できません。<br />内容をご確認の上、送信してください。
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
