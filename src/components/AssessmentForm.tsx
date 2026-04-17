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

// 属性の選択肢（Googleフォームと完全一致させる）
const ROLE_OPTIONS = [
  "経営層（役員・CxOなど）",
  "管理職（係長・課長・部長など）",
  "一般社員",
];

const DEPARTMENT_OPTIONS = [
  "総務",
  "人事",
  "法務",
  "経理",
  "財務",
  "マーケティング",
  "宣伝",
  "広報",
  "販売促進",
  "営業",
  "技術/開発",
  "秘書",
  "その他",
];

// セクションと設問の定義
type Question = {
  id: string;
  label: string;
  executiveOnly?: boolean; // trueなら経営層のみ表示
};

type Section = {
  title: string;
  questions: Question[];
};

const SECTIONS: Section[] = [
  {
    title: "1. 相手への尊重と「自分らしさ」",
    questions: [
      {
        id: "M-1-1",
        label:
          "私の部署には、性別・年代・出身・国籍などが異なる、多様な背景を持つメンバーが実際に在籍している。",
      },
      {
        id: "M-1-2",
        label:
          "私の部署には、異なる専門スキルや過去のキャリア、価値観を持つメンバーがバランスよく配置されている。",
      },
      {
        id: "M-1-3",
        label:
          "私の部署では、「空気を読む」ことよりも、「異なる視点」や価値観を提示することが歓迎されている。",
      },
      {
        id: "M-1-4",
        label:
          "私は、職場で「自分らしく」いることができ、このチームの一員であることに誇り（愛着）を感じている。",
      },
      {
        id: "M-1-5",
        label:
          "会議や業務において、少数派の意見や立場の弱い人の発言も、遮られずに尊重されている。",
      },
      {
        id: "M-1-6",
        label:
          "私たちは、自分たちが持っている「無意識の偏見（アンコンシャス・バイアス）」について、学びや対話の機会を持っている。",
      },
      {
        id: "M-1-7",
        label:
          "業務において、チャットやクラウドなど、時間や場所を選ばない働き方を支えるITツールが十分に活用されている。",
      },
      {
        id: "M-1-8",
        label:
          "育児・介護・副業など、個人の事情に合わせた柔軟な働き方が、人事制度として公式に認められ運用されている。",
      },
      {
        id: "M-1-9",
        label:
          "私は、現在の業務を通じて、自分の専門外の知識に触れたり、新しい視点を学ぶ経験ができている。",
      },
      {
        id: "M-1-10",
        label:
          "私の会社では、人材の固定化を防ぎ、新たな視点を取り入れるための「戦略的な人事異動」が推奨されている。",
      },
      {
        id: "E-1-3",
        label:
          "採用面接では、面接官の主観や好みではなく、構造化された「共通の評価基準」に基づいて判断している。",
        executiveOnly: true,
      },
      {
        id: "E-1-4",
        label:
          "採用活動において、同質的な人材（自分たちと似た人）に偏らず、あえて異質な才能を採用するための具体的な仕組みがある。",
        executiveOnly: true,
      },
    ],
  },
  {
    title: "2. ビジョンへの共感と「腹落ち」",
    questions: [
      {
        id: "M-2-1",
        label:
          "私は、所属部署が目指すビジョンやミッションを、自分の言葉で他者に説明できる。",
      },
      {
        id: "M-2-2",
        label:
          "私たちのチームの日々の活動は、掲げているビジョン・ミッションと矛盾なく連動している。",
      },
      {
        id: "M-2-3",
        label:
          "経営層やリーダーは、機会があるごとに繰り返し、熱意を持ってビジョンやミッションを語っている。",
      },
      {
        id: "E-2-4",
        label:
          "経営層は、短期的な利益だけでなく、「社会に対するインパクト（パーパス）」を優先して意思決定を行っている。",
        executiveOnly: true,
      },
      {
        id: "E-2-5",
        label:
          "私の部署には、全員が目指すべき明確な「共通の指針（ビジョン・ミッション）」が設定・共有されている。",
        executiveOnly: true,
      },
      {
        id: "M-2-5",
        label:
          "困難な判断を迫られた際、前例や忖度ではなく、「ビジョン・ミッション（あるべき姿）」を基準に意思決定が行われている。",
      },
      {
        id: "M-2-6",
        label:
          "私は、組織のビジョン・ミッションを「自分事」として捉え、心から共感している。",
      },
      {
        id: "M-2-7",
        label:
          "私たちのチームは、目の前の業務だけでなく、「未来どうあるべきか（中長期ビジョン）」について議論する時間を持っている。",
      },
      {
        id: "M-2-8",
        label:
          "私の部署では、短期的な数字の達成だけでなく、中長期的なビジョンの実現に向けた「種まき（投資的活動）」を行っている。",
      },
      {
        id: "M-2-9",
        label: "私は、自分の仕事が、社会、会社、顧客の役に立っていると感じる。",
      },
    ],
  },
  {
    title: "3. 任せる信頼と「自分で決める意志」",
    questions: [
      {
        id: "M-3-1",
        label:
          "私は、自分の仕事の進め方や目標について、上司の指示を待つのではなく、自ら提案し、合意できている。",
      },
      {
        id: "M-3-2",
        label:
          "私は、業務を遂行するために必要な「裁量権」を与えられており、自分の判断で仕事を進めることができる。",
      },
      {
        id: "M-3-3",
        label:
          "私の上司は、業務管理だけでなく、私の将来のキャリアや成長に関心を持ち、支援してくれている。",
      },
      {
        id: "M-3-4",
        label:
          "私の上司は、私に何を期待しているかを明確に伝え、納得いくまで対話した上で目標を設定している。",
      },
      {
        id: "M-3-5",
        label:
          "上司との1on1（定期面談）は、単なる進捗報告ではなく、私の悩みや考えを聴いてもらう「対話の時間」として機能している。",
      },
      {
        id: "M-3-6",
        label:
          "私は、自分の成果やプロセスが、上司から事実に基づいて公平かつ納得感をもって評価されていると感じる。",
      },
      {
        id: "M-3-7",
        label:
          "当社の人事評価は、短期的な数字だけでなく、新しい挑戦やスキルの習得といった「成長プロセス」も十分に考慮されている。",
      },
      {
        id: "M-3-8",
        label:
          "私には、上司に対して率直な意見やフィードバック（改善提案など）を伝える機会があり、それが許容されている。",
      },
      {
        id: "M-3-9",
        label:
          "私は、組織の課題や改善点について、不利益や批判を心配することなく、意見や提案をすることができる。",
      },
    ],
  },
  {
    title: "4. 仕事の「面白さ」と好奇心",
    questions: [
      {
        id: "M-4-1",
        label:
          "私は、業務に必要な情報や過去の知見に、組織の壁に阻まれることなくスムーズにアクセスできる。",
      },
      {
        id: "M-4-2",
        label:
          "この会社には、私の「知的好奇心」を刺激する学びの機会や、熱意ある同僚との交流がある。",
      },
      {
        id: "M-4-3",
        label:
          "私は、業務で不明な点があれば、「こんなことを聞いたら恥ずかしい」と思わず、誰にでも気軽に質問できる。",
      },
      {
        id: "M-4-4",
        label:
          "私の部署では、素朴な疑問や突飛なアイデアであっても、否定されずに歓迎される雰囲気がある。",
      },
      {
        id: "M-4-5",
        label:
          "社内には、役職に関わらず新しいアイデアを提案・実現できる「公式なルートや仕組み」が存在する。",
      },
      {
        id: "M-4-6",
        label:
          "私は、本来の業務以外でも、将来のイノベーションに繋がる「自分の関心事」に取り組む時間を持てている。",
      },
      {
        id: "M-4-7",
        label:
          "会社は、社員のスキルアップや研修に対して、十分な予算と時間（リソース）を投資している。",
      },
      {
        id: "M-4-8",
        label:
          "職場には、社員同士が知識を教え合ったり、共に学び合ったりするコミュニティや文化がある。",
      },
      {
        id: "M-4-9",
        label:
          "私は、日々の業務や学習機会を通じて、以前の自分よりも成長していると実感できる。",
      },
      {
        id: "M-4-10",
        label:
          "職場では、成果や貢献に対して、「ありがとう」や賞賛の言葉が日常的にオープンに交わされている。",
      },
      {
        id: "M-4-11",
        label:
          "配属や異動において、会社の都合だけでなく、個人のキャリア希望や成長意欲が十分に考慮されている。",
      },
    ],
  },
  {
    title: "5. 安心感と「恐れなき挑戦」",
    questions: [
      {
        id: "M-5-1",
        label:
          "私たちのチームでは、ミスが発生した際、「個人を責める」のではなく「仕組みを改善する（学習する）」ことに焦点が当てられる。",
      },
      {
        id: "M-5-2",
        label:
          "私たちは、見て見ぬふりをせず、耳の痛い課題やネガティブな問題についても率直に指摘し合える。",
      },
      {
        id: "M-5-3",
        label:
          "職場では、意見や考え方が自分と違っていても、それを理由に冷たく扱われたり拒絶されたりすることはない。",
      },
      {
        id: "M-5-4",
        label:
          "新しい挑戦の結果としての「ナイス・トライ（賢い失敗）」は、たとえ短期的な成果が出なくても評価・賞賛される。",
      },
      {
        id: "M-5-5",
        label:
          "私は、業務で行き詰まった時、「弱み」を見せても評価が下がらないと信じて、早めに周囲に助けを求めることができる。",
      },
      {
        id: "M-5-6",
        label:
          "チームメンバーは、自分の仕事の成功を願ってくれており、意図的に妨げるようなことはしないと信頼できる。",
      },
      {
        id: "M-5-7",
        label:
          "私は、自分の持っている強みやスキルが、チーム内で正当に理解され、十分に活かされていると感じる。",
      },
    ],
  },
  {
    title: "6.「壁を超える」連携",
    questions: [
      {
        id: "M-6-1",
        label:
          "私は、役職や年次に関わらず、「誰が言ったか」よりも「何を言ったか」で判断され、対等な立場で意見交換ができる。",
      },
      {
        id: "M-6-2",
        label:
          "私たちのチームは、チャットツール等を活用し、形式張らずにスピーディなコミュニケーションを行っている。",
      },
      {
        id: "M-6-3",
        label:
          "重要な決定事項や情報は、一部の人だけでなく、必要なメンバー全員にタイムリーかつ透明性高く共有されている。",
      },
      {
        id: "M-6-4",
        label:
          "私は、自分の部署だけでなく、他部署のメンバーとも日常的に情報交換や交流を行っている。",
      },
      {
        id: "M-6-5",
        label:
          "私は、自分の部署の枠にとらわれず、組織全体の目的のために他部署と協力し合っている。",
      },
      {
        id: "M-6-6",
        label:
          "職場（オンライン含む）には、業務連絡以外の雑談や、ふとした会話が自然と生まれる環境がある。",
      },
      {
        id: "M-6-7",
        label:
          "会議では、誰かのアイデアを即座に否定せず、「それ、いいね！」と受け止めて発展させる建設的な対話が行われている。",
      },
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
  const formTopRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company") || "";
  const companyName = searchParams.get("name") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalSteps = SECTIONS.length + 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const setAnswer = (key: string, value: string | null) => {
    if (!value) return;
    setAnswers((prev) => ({ ...prev, [key]: value }));

    // PCのみ: 次の設問へ自動スクロール
    if (currentStep > 0 && window.innerWidth >= 640) {
      const currentQuestions = SECTIONS[currentStep - 1].questions.filter(
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

  const handleNext = () => {
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

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
    setIsSubmitting(false);

    if (success) {
      setIsCompleted(true);
    } else {
      alert("送信に失敗しました。もう一度お試しください。");
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

              <div className="space-y-6">
                {SECTIONS[currentStep - 1].questions
                  .filter(
                    (q) =>
                      !q.executiveOnly ||
                      answers["role"] === "経営層（役員・CxOなど）",
                  )
                  .map((question, index) => (
                    <div
                      key={question.id}
                      id={`question-${question.id}`}
                      className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4 shadow-sm"
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
