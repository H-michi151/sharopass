# 社労士試験模試アプリ (sharoshi-app) - 開発コンテキスト

## プロジェクト概要

社会保険労務士試験の模擬試験Webアプリ。
Next.js 14 (App Router) + TypeScript + Zustand + Firebase で構築。

## 技術スタック

- **フレームワーク**: Next.js 14.2.0 (App Router)
- **言語**: TypeScript
- **状態管理**: Zustand + zustand/middleware (persist)
- **スタイル**: Vanilla CSS (globals.css, CSS変数)
- **DB/Auth**: Firebase v10（設定待ち。現在はlocalStorageで代替）
- **ホスティング予定**: さくらのレンタルサーバービジネス or Vercel

## ディレクトリ構造

```
sharoshi-app/
├── CLAUDE.md                    # このファイル（開発コンテキスト）
├── DOCS.md                      # 設計仕様・Firestoreスキーマ
├── .env.local.example           # Firebase環境変数テンプレート
├── firestore.rules              # Firestoreセキュリティルール
├── next.config.mjs
├── package.json
├── tsconfig.json
└── src/
    ├── types/
    │   └── index.ts             # 全型定義（Question, Exam, Subject, Session等）
    ├── lib/
    │   ├── firebase.ts          # Firebase初期化（isFirebaseConfigured フラグあり）
    │   ├── firestoreHistory.ts  # Firestoreへの学習履歴保存/取得/削除
    │   └── sampleData.ts        # 問題プールデータ（SENTAKU_POOLS, TAKUITSU_POOLS）
    ├── stores/
    │   ├── authStore.ts         # 認証ストア（現在はデモユーザーのみ）
    │   ├── examStore.ts         # 試験ストア（採点・タイマー・復習ロード）
    │   └── studyHistoryStore.ts # 学習履歴ストア（persist + Firestore同期 + エクスポート）
    ├── components/
    │   ├── ExamTimer.tsx        # カウントダウンタイマー
    │   ├── QuestionNav.tsx      # 問題ナビゲーション
    │   ├── TakuitsuQuestion.tsx # 択一式問題UI（5択ラジオ）
    │   └── SentakuQuestion.tsx  # 選択式問題UI（20選択肢・1回のみ使用可能）
    └── app/
        ├── layout.tsx
        ├── globals.css
        ├── page.tsx             # ダッシュボード
        ├── exam/[type]/page.tsx # 試験ページ（sentaku/takuitsu）
        ├── result/[id]/page.tsx # 結果ページ
        ├── analytics/page.tsx   # 学習分析・復習・バックアップUI
        └── study/page.tsx       # 科目別学習モード
```

## 試験仕様

| 項目 | 選択式（sentaku）| 択一式（takuitsu）|
|------|----------------|-----------------|
| 科目数 | 8科目 (s1〜s8) | 7科目 (t1〜t7) |
| 問題数/科目 | 10問以上のプール→1問出題 | 15問のプール→10問出題 |
| 合計 | 5空欄×8科目=40点 | 10問×7科目=70点 |
| 試験時間 | 80分（カスタム可） | 210分（カスタム可） |
| 合格基準 | 各科目3点以上・総得点26点以上 | 各科目4点以上・総得点44点以上 |

## 科目一覧

### 選択式（SENTAKU_POOLS）
- s1: 労働基準法・労働安全衛生法
- s2: 労働者災害補償保険法
- s3: 雇用保険法
- s4: 労災・雇用保険徴収法・労働関係一般常識
- s5: 社会保険一般常識
- s6: 健康保険法
- s7: 厚生年金保険法
- s8: 国民年金法

### 択一式（TAKUITSU_POOLS）
- t1: 労働基準法
- t2: 労働安全衛生法・労働者災害補償保険法
- t3: 雇用保険法
- t4: 労働関係一般常識・社会保険関係一般常識
- t5: 健康保険法
- t6: 厚生年金保険法
- t7: 国民年金法

## 主要な実装ポイント

### 選択式（本試験準拠）
- **20個の選択肢**: correctAnswers(5) + additionalChoices(15)
- **1回のみ使用可**: 使用済み選択肢は disabled（SentakuQuestion.tsx）
- **ランダムシャッフル**: 毎回問題と選択肢をシャッフル
- 空欄ボタンの再クリックで解除可能

### 学習履歴（studyHistoryStore）
- **localStorage**: Zustand persist で自動保存（`sharoshi-study-history`）
- **Firestore同期**: isFirebaseConfigured=true の場合のみ有効
- **エクスポート**: JSONファイルでダウンロード（バックアップ）
- **インポート**: JSONファイルから復元（重複排除あり）
- **復習モード**: ExamRecord に questions/answers を保存し、後から復習可能

### 状態遷移
```
selectモード（科目選択）→ studyingモード（解答）→ reviewモード（答え合わせ）
```
※ 科目別学習（/study）は全問回答 → まとめて答え合わせ

## Firebase設定（未設定状態での動作）

`.env.local` に `NEXT_PUBLIC_FIREBASE_API_KEY` が未設定の場合:
- `isFirebaseConfigured = false`
- Firestoreへのアクセスは完全にスキップ
- localStorageのみで完全動作する

Firebase設定手順は `DOCS.md` を参照。

## 未解決の問題

1. **sampleData.tsの判例問題**: explanation フィールドが一部未設定（tscエラーあり）
   - 対象行: 44, 45, 91, 92, 108
   - → 各問題に explanation を追加する必要がある

2. **さくらレンタルサーバー対応**: Node.js非対応のため
   - フロントは Vercel（無料）でホスト
   - データ保存は Firebase Firestore または PHP API + さくらMySQL

## 次の実装課題

- [ ] Firebase Authentication の実装（メール/パスワード + Google）
- [ ] sampleData.ts の判例問題に explanation を追加（tscエラー解消）
- [ ] さくらMySQL + PHP API での学習履歴保存（Firebase代替案）
- [ ] ユーザーログイン画面の実装（/login ページ）
- [ ] 本番デプロイ（Vercel）

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動（http://localhost:3000）
npx tsc --noEmit     # 型チェック
npm run build        # 本番ビルド
```

## 注意事項

- `sampleData.ts` は大きいファイル（200KB超）。編集はPythonスクリプト推奨
- CSS変数は `globals.css` で定義（--color-accent, --color-bg-card 等）
- デモログインは `authStore.loginDemo()` で uid='demo-user' でログイン
