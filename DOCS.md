# 社会保険労務士試験 模試Webアプリ - 設計ドキュメント

## ディレクトリ構造

```
sharoshi-app/
├── .env.local.example          # Firebase環境変数テンプレート
├── firestore.rules             # Firestoreセキュリティルール
├── next.config.mjs
├── tailwind.config.ts          # カスタムテーマ設定
├── package.json
├── tsconfig.json
├── src/
│   ├── types/
│   │   └── index.ts            # 全型定義（Question, Exam, Subject等）
│   ├── lib/
│   │   ├── firebase.ts         # Firebase初期化
│   │   └── sampleData.ts       # サンプル問題データ生成
│   ├── stores/
│   │   ├── authStore.ts        # Zustand認証ストア
│   │   └── examStore.ts        # Zustand試験ストア（採点ロジック含む）
│   ├── components/
│   │   ├── ExamTimer.tsx        # カウントダウンタイマー
│   │   ├── QuestionNav.tsx      # 問題ナビゲーション（ジャンプ機能）
│   │   ├── TakuitsuQuestion.tsx # 択一式問題UI（5択ラジオ）
│   │   └── SentakuQuestion.tsx  # 選択式問題UI（空欄ドロップダウン）
│   └── app/
│       ├── layout.tsx           # ルートレイアウト
│       ├── globals.css          # グローバルCSS
│       ├── page.tsx             # ダッシュボード（トップページ）
│       ├── exam/
│       │   └── [type]/
│       │       └── page.tsx     # 試験ページ（sentaku/takuitsu）
│       └── result/
│           └── [id]/
│               └── page.tsx     # 結果ページ
```

---

## Firestoreスキーマ設計

### Collection: `users`
```
users/{uid}
├── uid: string
├── email: string
├── displayName: string
├── photoURL?: string
├── createdAt: timestamp
├── lastLoginAt: timestamp
├── examHistory: string[]  // result IDs
└── totalExamsTaken: number
```

### Collection: `exams`
```
exams/{examId}
├── id: string
├── title: string
├── description: string
├── type: "sentaku" | "takuitsu"
├── timeLimit: number (秒)
├── subjects: Subject[]
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Collection: `questions`
```
questions/{questionId}
├── id: string
├── examId: string (reference)
├── type: "sentaku" | "takuitsu"
├── subjectId: string
├── subjectName: string
├── questionNumber: number
├── globalNumber: number
├── text: string
├── choices?: string[] (択一式)
├── correctAnswer?: string (択一式: "1"-"5")
├── blanks?: Blank[] (選択式)
│   ├── id: string
│   ├── position: number
│   ├── correctAnswer: string
│   └── choices: string[]
├── explanation?: string
├── tags: string[]
└── difficulty: number (1-5)
```

### Collection: `sessions`
```
sessions/{sessionId}
├── id: string
├── examId: string
├── userId: string
├── type: "sentaku" | "takuitsu"
├── status: "in_progress" | "completed" | "timed_out"
├── answers: Map<questionId, UserAnswer>
├── startedAt: timestamp
├── completedAt?: timestamp
├── remainingTime: number
└── currentQuestionIndex: number
```

### Collection: `results`
```
results/{resultId}
├── id: string
├── sessionId: string
├── examId: string
├── userId: string
├── type: "sentaku" | "takuitsu"
├── subjectResults: SubjectResult[]
│   ├── subjectId: string
│   ├── subjectName: string
│   ├── score: number
│   ├── maxScore: number
│   ├── percentage: number
│   ├── passingScore: number (足切りライン)
│   ├── isPassing: boolean
│   └── tagResults: TagResult[]
├── totalScore: number
├── maxTotalScore: number
├── totalPercentage: number
├── isPassingAllSubjects: boolean
├── isPassingTotal: boolean
├── isPassing: boolean
├── deviation: number (偏差値)
├── completedAt: timestamp
└── timeTaken: number (秒)
```

### Collection: `analysis`
```
analysis/{userId}
├── userId: string
├── subjectAccuracy: Map<subjectId, {correct, total, percentage}>
├── tagAccuracy: Map<tag, {correct, total, percentage}>
├── recentTrend: Array<{date, sentakuScore?, takuitsuScore?}>
├── weakTags: string[]
├── strongTags: string[]
└── updatedAt: timestamp
```

---

## Firebase設定手順

### 1. Firebaseプロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `sharoshi-moshi` を入力
4. Google Analytics有効化（任意）

### 2. Authentication設定
1. 左メニュー > Authentication > 始める
2. 「Sign-in method」タブ
3. 「メール/パスワード」を有効にする
4. 「Google」を有効にする → プロジェクトのサポートメールを設定

### 3. Firestore Database設定
1. 左メニュー > Firestore Database > データベースを作成
2. 本番モード or テストモードを選択
3. リージョン: `asia-northeast1` (東京) を選択
4. firestore.rules の内容をルールタブに貼り付け

### 4. Webアプリ追加
1. プロジェクト設定 > マイアプリ > ウェブ
2. アプリのニックネーム: `sharoshi-web`
3. Firebase Hosting もチェック
4. 表示されるconfig値を `.env.local` に設定

### 5. 環境変数設定
```bash
cp .env.local.example .env.local
# 各値をFirebase Consoleの設定値で埋める
```

---

## デプロイ手順

### Firebase Hosting デプロイ

```bash
# Firebase CLIインストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化
firebase init
# → Hosting を選択
# → 既存のプロジェクトを選択
# → public directory: out
# → SPA: Yes

# ビルド
npm run build

# デプロイ
firebase deploy
```

### next.config.mjs の修正（Static Export用）
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
};
export default nextConfig;
```

---

## 試験仕様まとめ

| 項目 | 選択式（午前） | 択一式（午後） |
|------|---------------|---------------|
| 科目数 | 8科目 | 7科目 |
| 1科目あたり | 5空欄 | 10問 |
| 合計 | 40問 | 70問 |
| 試験時間 | 80分 | 210分 |
| 満点 | 40点 | 70点 |
| 合格総得点 | 26点以上 | 44点以上 |
| 科目別足切り | 各3点以上 | 各4点以上 |

---

## 将来拡張設計

### Phase 2: 機能強化
- [ ] 問題解説の詳細表示（提出後）
- [ ] 間違えた問題の復習モード
- [ ] ブックマーク機能（お気に入り問題）
- [ ] 学習進捗ダッシュボード
- [ ] 過去の偏差値推移グラフ

### Phase 3: ソーシャル機能
- [ ] 全国ランキング
- [ ] 実際の偏差値計算（全受験者データ）
- [ ] 模試スケジュール公開
- [ ] 学習仲間チャット

### Phase 4: コンテンツ拡充
- [ ] 年度別過去問データベース
- [ ] AI問題生成（論点別カスタム模試）
- [ ] 音声読み上げ機能
- [ ] 印刷用PDF出力

### Phase 5: 運用・収益化
- [ ] 管理画面（問題登録・ユーザー管理）
- [ ] 有料プラン（Stripe連携）
- [ ] アクセス解析ダッシュボード
- [ ] プッシュ通知（学習リマインダー）
