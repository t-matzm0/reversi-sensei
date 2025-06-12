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