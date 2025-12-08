# オセロ先生 (Reversi Sensei)

オセロ（リバーシ）の戦略を基礎から学べるWebアプリケーションです。PC・モバイル両対応で、AIとの対戦を通じてオセロの腕を磨くことができます。

## 特徴

- 🎮 **インタラクティブな対戦**: リアルタイムでAIまたは人間と対戦
- 🤖 **3段階のAI難易度**: 初心者から上級者まで楽しめる
- 💡 **ヒント機能**: 次に打てる手を視覚的に表示
- 📱 **レスポンシブデザイン**: PC・タブレット・スマートフォンに対応
- 🎨 **洗練されたUI**: 見やすく美しいゲームボード

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **開発ツール**: ESLint, Prettier, Husky
- **CI/CD**: GitHub Actions
- **自動化**: Claude Code による Issue 駆動開発

## セットアップ

### 必要な環境

- Node.js 18.0.0以上
- npm または yarn

### インストール手順

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/reversi-sensei.git
cd reversi-sensei
```

2. 依存関係をインストール

```bash
npm install
```

3. 開発サーバーを起動

```bash
npm run dev
```

4. ブラウザで http://localhost:3000 を開く

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# コード検査
npm run lint

# 型チェック
npm run type-check

# コードフォーマット
npm run format

# フォーマットチェック
npm run format:check
```

## プロジェクト構造

```
reversi-sensei/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reactコンポーネント
│   ├── lib/             # ゲームロジック・AI
│   └── types/           # TypeScript型定義
├── public/              # 静的ファイル
├── .github/workflows/   # GitHub Actions設定
└── package.json         # プロジェクト設定
```

## ゲームの遊び方

1. **ゲーム開始**: ページを開くと自動的にゲームが始まります
2. **石を置く**: 黄色い点が表示されている場所をクリック
3. **AI難易度変更**: 右側のパネルから難易度を選択
4. **対戦モード**: AIとの対戦/人間同士の対戦を切り替え可能

## 環境

### 本番環境

- URL: https://reversi-sensei.web.app
- ブランチ: `main`

### 検証環境

- URL: https://reversi-sensei-staging.web.app
- ブランチ: `develop`
- アクセス制御: パスワード認証あり

## 開発フロー

### 手動開発フロー

1. **機能開発**: `develop`ブランチから`feature/xxx`ブランチを作成
2. **プルリクエスト**: `feature/xxx` → `develop`
3. **検証環境**: `develop`ブランチに自動デプロイ
4. **本番リリース**: `develop` → `main`のプルリクエスト
5. **本番環境**: `main`ブランチに自動デプロイ

### 自動化フロー（Issue駆動開発）

1. **Issue作成**: バグ報告や機能リクエストをIssueで作成
2. **自動修正**: `claude-fix`ラベルでClaude Codeが自動的にPRを作成
3. **自動レビュー**: PRに対してClaude Codeが自動コードレビュー
4. **自動マージ**: レビュー承認後、条件を満たせば自動マージ
5. **自動デプロイ**: マージ後、該当環境に自動デプロイ

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) および [AUTOMATION.md](./AUTOMATION.md) を参照してください。

## 今後の機能追加予定

- [ ] オセロの戦略チュートリアル
- [ ] 棋譜の保存・読み込み
- [ ] オンライン対戦機能
- [ ] 詳細な統計情報
- [ ] 戦略解説モード

## ライセンス

MIT License

## 貢献

プルリクエストや課題報告を歓迎します！

### Issue の作成方法

1. [Issues](../../issues) から新しいIssueを作成
2. テンプレート（バグ報告/機能リクエスト）を選択
3. 詳細を記入
4. 自動修正を希望する場合は「Claude Codeによる自動修正を希望する」にチェック

### 必要なSecrets（メンテナー向け）

| Secret名                              | 説明                            |
| ------------------------------------- | ------------------------------- |
| `ANTHROPIC_API_KEY`                   | Claude API キー                 |
| `FIREBASE_TOKEN`                      | Firebase CLIトークン            |
| `FIREBASE_SERVICE_ACCOUNT_PRODUCTION` | Firebase サービスアカウントJSON |
