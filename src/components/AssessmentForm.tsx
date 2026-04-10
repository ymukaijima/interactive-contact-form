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
  {
    title: "2. ビジョン共有",
    questions: [
      { id: "M-2-1", label: "自分は、所属部署のビジョンやミッションを理解している" },
      { id: "M-2-2", label: "所属部署は、ビジョン・ミッション（またはそれに類するもの）を体現している" },
      { id: "M-2-3", label: "経営幹部は、従業員に所属部署のビジョンやミッションを伝えている" },
      { id: "M-2-5", label: "所属部署は、ビジョン・ミッション（またはそれに類するもの）に基づいて意思決定をしている" },
      { id: "M-2-6", label: "自分は、所属部署のビジョン・ミッション（またはそれに類するもの）に共感している" },
      { id: "M-2-7", label: "所属部署は、短期的な業務目標ではなく、中長期的なビジョン・ミッションに向けたコミュニケーションや議論をしている" },
      { id: "M-2-8", label: "所属部署は、短期的な業務目標ではなく、中長期的なビジョン・ミッションに向けた活動をしている" },
      { id: "M-2-9", label: "自分は、社会、会社、顧客の成長に貢献している" },
    ],
  },
  {
    title: "3. 自主性",
    questions: [
      { id: "M-3-1", label: "自分の仕事範囲や目標は、マネージャー（直属の上司）が決めるのではなく自分が発案して合意することができる" },
      { id: "M-3-2", label: "自分は、自分の仕事に関してマネージャー（直属の上司）から権限委譲されている" },
      { id: "M-3-3", label: "マネージャー（直属の上司）は、常に部下の成長を考えている" },
      { id: "M-3-4", label: "マネージャー（直属の上司）は、部下の目標や期待値に関して合意形成をしている" },
      { id: "M-3-5", label: "自分は、日頃からマネージャー（直属の上司）と個別面談（1対1）をしている" },
      { id: "M-3-6", label: "自分は、自分の仕事に関してマネージャー（直属の上司）から公正に評価されている" },
      { id: "M-3-7", label: "評価制度は、結果だけではなく、社員の成長も考慮している" },
      { id: "M-3-8", label: "自分は、マネージャー（直属の上司）に関する評価やフィードバックをすることができる" },
      { id: "M-3-9", label: "自分は、所属部署に関する評価やフィードバックをすることができる" },
    ],
  },
  {
    title: "4. 内発的動機付け",
    questions: [
      { id: "M-4-1", label: "自分は、知りたい情報を社内検索することができる" },
      { id: "M-4-2", label: "自分は、日頃から社内で好奇心を刺激されている" },
      { id: "M-4-3", label: "自分は、所属部署で誰にでも気軽に質問や相談をすることができる" },
      { id: "M-4-4", label: "所属部署は、いかなる意見や質問でも歓迎し許容している" },
      { id: "M-4-5", label: "所属部署には、投書箱やアイデアコンテストなど新しいアイデアを実現する仕組みがある" },
      { id: "M-4-6", label: "自分は、業務内容を問わず興味のあることに取り組むことができている" },
      { id: "M-4-7", label: "所属部署は、人材育成に人的・資金的リソースを十分に割いている" },
      { id: "M-4-8", label: "所属部署には、従業員がお互いに学びあう文化や仕組みがある" },
      { id: "M-4-9", label: "自分は、組織的な人材育成や日頃の仕事によって継続的に成長している" },
      { id: "M-4-10", label: "所属部署は、従業員に対しての賞賛や感謝をオープンに称えている" },
      { id: "M-4-11", label: "人事異動は、社員個人の意思や成長を十分に尊重している" },
    ],
  },
  {
    title: "5. リスクテイク",
    questions: [
      { id: "M-5-1", label: "所属部署は、社員がミスをしてもたいてい非難しない" },
      { id: "M-5-2", label: "所属部署は、課題や難しい問題を指摘し合える" },
      { id: "M-5-3", label: "所属部署は、自分と異なるということを理由に他者を拒絶しない" },
      { id: "M-5-4", label: "所属部署は、リスクのあるチャレンジを歓迎し許容している" },
      { id: "M-5-5", label: "所属部署は、他者に気軽に助けを求めることができる" },
      { id: "M-5-6", label: "所属部署は、自分を意図的におとしめるような行動をしない" },
      { id: "M-5-7", label: "所属部署は、自分のスキルや才能を尊重し活かしている" },
    ],
  },
  {
    title: "6. つながりとコラボレーション",
    questions: [
      { id: "M-6-1", label: "自分は、所属部署でいつでも誰とでも気軽にコミュニケーションできる" },
      { id: "M-6-2", label: "所属部署では、即時性の高いコミュニケーションツールを活用できている" },
      { id: "M-6-3", label: "所属部署は、即時性かつ透明性高く情報共有をしている" },
      { id: "M-6-4", label: "自分は、日頃から所属部署外の社員と気軽に交流している" },
      { id: "M-6-5", label: "自分は、業務において所属部署外の社員と頻繁にコラボレーション（協業）をしている" },
      { id: "M-6-6", label: "オフィス環境は、社員同士の偶発的なつながりや会話が生まれやすい" },
      { id: "M-6-7", label: "オフィス環境は、クリエイティブなアイデアを議論をしやすい" },
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

  const setAnswer = (key: string, value: string | null) => {
    if (!value) return;
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
    <div className="min-h-screen flex items-center justify-center px-4 md:px-8 py-12">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 md:p-14">

        {/* ヘッダー: タイトルエリア */}
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
            ASSESSMENT
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            組織課題アセスメント
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <p className="text-base text-gray-700 leading-relaxed">
              イノベーションを生み出す組織の課題と現状を把握するアセスメントです。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              各項目について、最も当てはまるものをお選びください。
            </p>
          </div>
        </header>

        {/* プログレスバー */}
        <div className="mb-10">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>STEP {currentStep + 1} / {totalSteps}</span>
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
                  <Label className="text-base font-medium text-gray-900">属性選択</Label>
                  <span className="text-xs text-orange-500 font-medium">必須</span>
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
                  <Label className="text-base font-medium text-gray-900">所属部署</Label>
                  <span className="text-xs text-orange-500 font-medium">必須</span>
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
          {currentStep > 0 && currentStep <= SECTIONS.length && (
            <div className="space-y-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {SECTIONS[currentStep - 1].title}
                </h2>
                <p className="text-base text-gray-400 mt-2">
                  各項目について、最も当てはまるものを選んでください
                </p>
              </div>

              <div className="space-y-10">
                {SECTIONS[currentStep - 1].questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-xl border border-gray-100 p-6 space-y-4"
                  >
                    <Label className="text-base leading-relaxed text-gray-800 block">
                      <span className="text-gray-400 mr-2">Q{index + 1}</span>
                      {question.label}
                    </Label>
                    <div className="flex gap-3 pt-2">
                      {SCALE_OPTIONS.map((option) => {
                        const isSelected = answers[question.id] === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setAnswer(question.id, option.value)}
                            className={`flex-1 flex flex-col items-center gap-2 rounded-xl border p-4 cursor-pointer transition-all text-center ${
                              isSelected
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-900"
                            }`}
                          >
                            <span className="text-lg font-semibold">{option.value}</span>
                            <span className="text-xs leading-tight opacity-70">
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
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
