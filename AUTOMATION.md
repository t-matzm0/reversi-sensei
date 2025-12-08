# CI/CD 自動化ガイド

このプロジェクトでは、GitHub Actions を使用した CI/CD パイプラインを導入しています。

## 概要

```
Issue作成 → 開発者が修正 → PR作成 → CI実行 → レビュー → マージ → 自動デプロイ
```

## ワークフロー一覧

### 1. CI (`ci.yml`)

**トリガー**: main/develop へのpush、PR作成時

**チェック内容**:

- ESLint（コード品質）
- TypeScript型チェック
- Next.jsビルド

### 2. Issue トリアージ (`issue-triage.yml`)

**トリガー**: Issue作成時・編集時

**機能**:

- Issueの内容に基づいて自動ラベル付け
- カテゴリの自動判定（AI、UI/UX、ゲームロジック等）
- 初回コントリビューターへのウェルカムメッセージ

### 3. ステージングデプロイ (`deploy-staging.yml`)

**トリガー**: developブランチへのpush

**機能**:

- Firebase Hosting (staging) へのデプロイ
- PRへのデプロイ完了コメント

### 4. 本番デプロイ (`deploy-production.yml`)

**トリガー**: mainブランチへのpush

**機能**:

- Firebase Hosting (production) へのデプロイ
- タグ付けされた場合はGitHub Releaseの作成

## ラベル体系

### Issue タイプ

| ラベル          | 説明                   |
| --------------- | ---------------------- |
| `bug`           | バグ報告               |
| `enhancement`   | 新機能・改善リクエスト |
| `documentation` | ドキュメント関連       |
| `question`      | 質問                   |

### ステータス

| ラベル         | 説明             |
| -------------- | ---------------- |
| `triage`       | トリアージ待ち   |
| `in-progress`  | 対応中           |
| `needs-review` | レビュー待ち     |
| `needs-fixes`  | 修正が必要       |
| `approved`     | レビュー承認済み |
| `merged`       | マージ済み       |

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
| `FIREBASE_TOKEN`                      | Firebase CLIトークン            |
| `FIREBASE_SERVICE_ACCOUNT_PRODUCTION` | Firebase サービスアカウントJSON |
| `STAGING_PASSWORD`                    | ステージング環境のパスワード    |

### ラベルのインポート

```bash
# GitHub CLIを使用してラベルをインポート
gh label import .github/labels.yml
```

## 開発フロー

1. **Issue作成**: バグ報告や機能リクエストをIssueで作成
2. **ブランチ作成**: `develop`から`feature/xxx`または`fix/xxx`ブランチを作成
3. **開発**: ローカルで開発（Claude Code等のツールを活用可能）
4. **PR作成**: 変更をpushしてPRを作成
5. **CI実行**: 自動的にlint、type-check、buildが実行される
6. **レビュー**: 人間によるコードレビュー
7. **マージ**: レビュー承認後、developにマージ
8. **ステージング確認**: 自動デプロイされたステージング環境で動作確認
9. **本番リリース**: develop → main のPRを作成してマージ
