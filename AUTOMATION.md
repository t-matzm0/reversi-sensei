# 自動化ガイド

このプロジェクトでは、GitHub IssueをトリガーとしたCI/CD自動化パイプラインを導入しています。

## 概要

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Issue     │───>│  Claude     │───>│    PR       │───>│   Deploy    │
│   作成      │    │  自動修正   │    │  レビュー   │    │   自動化    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## ワークフロー一覧

### 1. Issue トリアージ (`issue-triage.yml`)

**トリガー**: Issue作成時・編集時

**機能**:

- Issueの内容に基づいて自動ラベル付け
- カテゴリの自動判定（AI、UI/UX、ゲームロジック等）
- 初回コントリビューターへのウェルカムメッセージ
- `claude-fix`ラベルの自動付与（チェックボックスで希望した場合）

### 2. Claude 自動修正 (`claude-fix.yml`)

**トリガー**: `claude-fix`ラベルがIssueに付与された時

**機能**:

- Issueの内容を解析
- Claude Codeで自動的にコード修正
- 修正ブランチ作成とPR作成
- 品質チェック（lint、type-check、test）の実行

**使い方**:

1. Issue作成時に「Claude Codeによる自動修正を希望する」にチェック
2. または手動で`claude-fix`ラベルを付与
3. 自動的にPRが作成される

### 3. 自動コードレビュー (`auto-review.yml`)

**トリガー**: PR作成時・更新時

**機能**:

- ESLint、TypeScript、テストの自動実行
- Claude Codeによるコードレビュー
- レビュー結果をPRにコメント
- `quality-passed` / `needs-fixes`ラベルの自動付与

**レビュー観点**:

- バグの可能性
- セキュリティ問題
- パフォーマンス
- 可読性
- ベストプラクティス

### 4. 自動マージ (`auto-merge.yml`)

**トリガー**: PRレビュー承認時 / CIチェック完了時

**条件**:

- `auto-merge`または`approved`ラベルが付いている
- 人間のレビュー承認がある
- すべてのCIチェックが通っている

**機能**:

- 条件を満たしたPRを自動的にsquashマージ
- マージ完了通知

### 5. CI (`ci.yml`)

**トリガー**: main/developへのpush、PR作成時

**チェック内容**:

- ESLint
- TypeScript型チェック
- Next.jsビルド

### 6. ステージングデプロイ (`deploy-staging.yml`)

**トリガー**: developブランチへのpush

**機能**:

- Firebase Hosting (staging) へのデプロイ
- PRへのデプロイ完了コメント

### 7. 本番デプロイ (`deploy-production.yml`)

**トリガー**: mainブランチへのpush

**機能**:

- Firebase Hosting (production) へのデプロイ
- タグ付けされた場合はGitHub Releaseの作成

## ラベル体系

### 自動化関連

| ラベル           | 説明                          |
| ---------------- | ----------------------------- |
| `claude-fix`     | Claude Codeによる自動修正対象 |
| `auto-generated` | 自動生成されたPR              |
| `auto-merge`     | 自動マージ対象                |
| `quality-passed` | 品質チェック通過              |
| `needs-fixes`    | 修正が必要                    |
| `approved`       | レビュー承認済み              |

### ステータス

| ラベル         | 説明           |
| -------------- | -------------- |
| `triage`       | トリアージ待ち |
| `in-progress`  | 対応中         |
| `needs-review` | レビュー待ち   |
| `merged`       | マージ済み     |

### 優先度

| ラベル            | 説明       |
| ----------------- | ---------- |
| `priority-high`   | 優先度：高 |
| `priority-medium` | 優先度：中 |
| `priority-low`    | 優先度：低 |

### カテゴリ

| ラベル        | 説明               |
| ------------- | ------------------ |
| `game-logic`  | ゲームロジック関連 |
| `ai`          | AI関連             |
| `ui-ux`       | UI/UX関連          |
| `performance` | パフォーマンス関連 |
| `ci-cd`       | CI/CD関連          |
| `testing`     | テスト関連         |

## セットアップ

### 必要なSecrets

GitHub リポジトリの Settings > Secrets and variables > Actions で以下を設定:

| Secret名                              | 説明                            |
| ------------------------------------- | ------------------------------- |
| `ANTHROPIC_API_KEY`                   | Claude API キー                 |
| `FIREBASE_TOKEN`                      | Firebase CLIトークン            |
| `FIREBASE_SERVICE_ACCOUNT_PRODUCTION` | Firebase サービスアカウントJSON |
| `STAGING_PASSWORD`                    | ステージング環境のパスワード    |

### ラベルのインポート

```bash
# GitHub CLIを使用してラベルをインポート
gh label import .github/labels.yml
```

## トラブルシューティング

### Claude自動修正が失敗する場合

1. `ANTHROPIC_API_KEY`が正しく設定されているか確認
2. Issueの内容が具体的かどうか確認
3. 複雑な修正の場合は手動対応を検討

### 自動マージが動作しない場合

1. `auto-merge`または`approved`ラベルが付いているか確認
2. 人間によるレビュー承認があるか確認
3. すべてのCIチェックが通っているか確認

### デプロイが失敗する場合

1. Firebaseの認証情報を確認
2. ビルドエラーを確認
3. Firebase Hostingの設定を確認

## ベストプラクティス

1. **Issueは具体的に**: 自動修正の精度向上のため、再現手順や期待動作を明確に
2. **小さな変更を推奨**: 大きな変更は手動レビューを推奨
3. **テストを書く**: 自動修正でもテストがあれば品質を担保できる
4. **ラベルを活用**: 適切なラベル付けでワークフローが効率化
