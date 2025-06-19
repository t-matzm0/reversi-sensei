# デプロイメントガイド

## ブランチ戦略

### メインブランチ

- **main**: 本番環境用ブランチ
- **develop**: 開発用ブランチ

### ワークフロー

1. 新機能開発: `develop`ブランチから`feature/xxx`ブランチを作成
2. 開発完了後: `feature/xxx` → `develop`にプルリクエスト
3. 検証完了後: `develop` → `main`にプルリクエスト
4. 本番リリース: `main`ブランチにマージ

## 環境構成

### 検証環境（Staging）

- **ブランチ**: `develop`
- **URL**: https://reversi-sensei-staging.web.app
- **デプロイトリガー**: `develop`ブランチへのpush
- **アクセス制御**: パスワード認証

### 本番環境（Production）

- **ブランチ**: `main`
- **URL**: https://reversi-sensei.web.app
- **デプロイトリガー**: `main`ブランチへのpush
- **アクセス制御**: なし（公開）

## Firebase プロジェクト設定

### 必要なFirebaseプロジェクト

1. **reversi-sensei-staging** (検証環境)
2. **reversi-sensei** (本番環境)

### Firebase CLI セットアップ

```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクトの初期化
firebase init hosting

# 検証環境の設定
firebase use staging

# 本番環境の設定
firebase use production
```

## GitHub Secrets 設定

以下のSecretsをGitHubリポジトリに設定してください：

### Firebase関連

- `FIREBASE_TOKEN`: Firebase CLIトークン
- `FIREBASE_SERVICE_ACCOUNT_STAGING`: 検証環境用サービスアカウント
- `FIREBASE_SERVICE_ACCOUNT_PRODUCTION`: 本番環境用サービスアカウント

### Staging認証

- `STAGING_PASSWORD`: 検証環境アクセス用パスワード

### Firebase Tokenの取得方法

```bash
firebase login:ci
```

## ブランチ保護ルール（推奨設定）

### mainブランチ

- プルリクエストを必須とする
- レビュー承認を1人以上必須とする
- ステータスチェックを必須とする
  - CI (lint, type-check, build)
- プッシュを制限する
- 強制プッシュを禁止する

### developブランチ

- プルリクエストを必須とする
- ステータスチェックを必須とする
  - CI (lint, type-check, build)

## 手動デプロイ方法

### 検証環境へのデプロイ

```bash
npm run deploy:staging
```

### 本番環境へのデプロイ

```bash
npm run deploy:production
```

## トラブルシューティング

### デプロイが失敗する場合

1. GitHub Secretsが正しく設定されているか確認
2. Firebase プロジェクトが存在するか確認
3. ビルドエラーがないか確認

### Firebase認証エラー

```bash
# Firebase再ログイン
firebase logout
firebase login
```

### 環境変数が反映されない場合

1. .env.local ファイルを確認
2. GitHub Actionsの環境変数を確認
3. Next.js設定ファイルを確認
