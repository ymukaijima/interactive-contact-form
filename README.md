# Interactive Contact Form

組織風土・働きがいに関するアセスメントフォーム。React (Next.js) で作成し、Google Apps Script (GAS) 経由で Google スプレッドシートにデータを保存する。

## アーキテクチャ

```
React (フォーム入力)
  ↓ ?company=A001&name=会社A の URL パラメータで会社識別
  ↓ GET リクエスト + JSON データ
GAS (doGet)
  ↓ マスタースプシに全データを集約
マスタースプシ
  ↓ 会社IDに応じて自動振り分け
会社別スプシ
  ↓ Looker Studio に連携
Looker Studio
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env.local` を作成：

```
NEXT_PUBLIC_GAS_ENDPOINT_URL=https://script.google.com/macros/s/<YOUR_SCRIPT_ID>/exec
```

Vercel にデプロイする場合は、Vercel ダッシュボードの **Settings → Environment Variables** で同じ変数を Production / Preview に追加する。

### 3. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` でアクセス。

## 使い方

会社ごとに専用 URL を発行する：

```
https://your-domain.com/?company=A001&name=会社A
```

| パラメータ | 意味 |
|---|---|
| `company` | 会社ID（GAS の COMPANY_SHEETS に登録されているもの） |
| `name` | 会社名（マスタースプシに記録される表示名） |

回答者は URL からアクセスするだけで、自動的に該当の会社のスプシにデータが振り分けられる。

## ファイル構成

```
src/
├── app/
│   └── page.tsx           # ページ本体
├── components/
│   ├── AssessmentForm.tsx     # フォーム本体（state・バリデーション・画面）
│   ├── FloatingBackground.tsx # 背景アニメーション
│   └── ui/                    # shadcn/ui コンポーネント
├── constants/
│   ├── form.ts            # GAS URL（env）と entry ID
│   └── questions.ts       # 設問データ・選択肢
└── lib/
    └── googleForm.ts      # GAS への送信関数
```

## 会社の追加方法

新しい会社のスプシを作成し、GAS に登録する：

1. GAS エディタで `addNewCompany()` 関数の `companyId` と `companyName` を書き換える
2. 関数を実行 → 原本スプシのコピーが作成される
3. ログに表示された新しいスプシIDを `COMPANY_SHEETS` に追加：
   ```javascript
   const COMPANY_SHEETS = {
     "A001": "1D15jwbX4...",
     "B002": "新しいスプシID",  // 追加
   };
   ```
4. GAS をデプロイし直す

## デプロイ

main ブランチにマージすると Vercel が自動でデプロイする。

- **本番**: `main` ブランチ → 本番 URL
- **プレビュー**: 各ブランチ → `<branch>-<project>.vercel.app`

## 技術スタック

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (Select, Button, Label, Progress)
- **framer-motion** (背景アニメーション)
- **Google Apps Script** (バックエンド)
