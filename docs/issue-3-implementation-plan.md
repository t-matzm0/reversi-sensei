# Issue #3: 先生が説明してくれる機能 - 実装方針

## コンセプト

「Reversi Sensei（リバーシ先生）」というアプリ名にふさわしく、AIが「先生」として各手の良し悪しを日本語で分かりやすく説明する機能を実装します。

指導碁のように、ユーザーが打った手や候補手に対して「なぜその評価になるのか」を具体的に説明することで、リバーシの戦略を学ぶことができます。

---

## 実装アプローチ

### Phase 1: 説明生成エンジン（基盤）

#### 1.1 評価要素の分解

現在の`evaluatePosition`関数を拡張し、各評価要素のスコアを個別に返す関数を作成します。

```typescript
// src/lib/moveExplanation.ts
interface EvaluationBreakdown {
  coin: number;        // 石数差
  mobility: number;    // モビリティ（打てる手数の差）
  corner: number;      // 角占有
  closeness: number;   // X打ち/C打ちのペナルティ
  stability: number;   // 確定石
  frontier: number;    // 境界石
  positional: number;  // 位置評価
  total: number;       // 総合評価
}

function getEvaluationBreakdown(board: Board, player: Player): EvaluationBreakdown
```

#### 1.2 手の影響分析

手を打つ前と後の各要素の差分を計算し、どの要素が大きく変化したかを特定します。

```typescript
interface MoveImpact {
  move: Position;
  before: EvaluationBreakdown;
  after: EvaluationBreakdown;
  changes: {
    element: keyof EvaluationBreakdown;
    delta: number;
    significance: 'high' | 'medium' | 'low';
  }[];
}

function analyzeMoveImpact(board: Board, move: Position, player: Player): MoveImpact
```

### Phase 2: 説明テンプレートシステム

#### 2.1 評価要素別の説明テンプレート

各評価要素に対応する日本語説明テンプレートを作成します。

| 要素 | 良い場合の説明例 | 悪い場合の説明例 |
|------|-----------------|-----------------|
| **角占有** | 「角を取りました！角は絶対に取られない確定石です」 | 「相手に角を取られてしまいました」 |
| **X打ち** | - | 「この手はX打ち（角の斜め隣）です。相手に角を取られる危険があります」 |
| **C打ち** | - | 「この手はC打ち（角の隣）です。角を取られやすくなります」 |
| **モビリティ** | 「相手の打てる場所を減らす良い手です」 | 「自分の打てる場所が少なくなってしまいます」 |
| **確定石** | 「確定石（絶対に取られない石）が増えました」 | - |
| **境界石** | 「石が安定した位置にあります」 | 「境界石（取られやすい石）が増えてしまいます」 |
| **位置** | 「盤面の良い位置を確保できます」 | 「あまり良くない位置です」 |

#### 2.2 ゲーム進行度による説明の調整

```typescript
type GamePhase = 'opening' | 'midgame' | 'endgame';

const phaseExplanations = {
  opening: {
    priority: ['mobility', 'positional', 'closeness'],
    context: '序盤は石を取りすぎないことが大切です。打てる場所を多く確保しましょう。'
  },
  midgame: {
    priority: ['corner', 'stability', 'closeness'],
    context: '中盤は角と確定石が重要です。角を取られないように注意しましょう。'
  },
  endgame: {
    priority: ['coin', 'stability'],
    context: '終盤は石の数が勝敗を決めます。確実に石を増やしましょう。'
  }
};
```

### Phase 3: UI/UXコンポーネント

#### 3.1 先生コメントコンポーネント

```typescript
// src/components/SenseiComment.tsx
interface SenseiCommentProps {
  explanation: MoveExplanation;
  rating: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
  showAlternative?: boolean;  // より良い手の提案を表示するか
}
```

**デザイン案:**
- 先生アイコン（または絵文字）を左に配置
- 吹き出し形式でコメントを表示
- 評価に応じた色分け（緑: 良い手、赤: 悪い手）
- フェードイン/アウトのアニメーション

#### 3.2 表示タイミングオプション

| タイミング | 説明 |
|-----------|------|
| **手を打った後** | ユーザーが手を打った直後に自動表示（デフォルト） |
| **ホバー時** | 候補手にマウスを乗せた時にプレビュー表示 |
| **リクエスト時** | 「説明を見る」ボタンをクリックした時のみ表示 |

#### 3.3 設定オプション

```typescript
// ゲーム設定に追加
interface GameSettings {
  // ... 既存設定
  senseiMode: 'always' | 'on-request' | 'off';  // 先生の説明モード
  showAlternatives: boolean;  // より良い手の提案を表示
  explanationDetail: 'simple' | 'detailed';  // 説明の詳しさ
}
```

### Phase 4: 拡張機能（将来）

#### 4.1 総合評価メッセージ

```typescript
const ratingMessages = {
  excellent: ['素晴らしい手です！', '完璧です！', 'プロ級の一手です！'],
  good: ['良い手です', 'なかなか良いですね', '正解です'],
  neutral: ['普通の手です', '悪くはありません'],
  bad: ['少し危険な手です', 'もう少し良い手がありそうです'],
  terrible: ['これは悪手です！', '相手に有利になってしまいます']
};
```

#### 4.2 代替手の提案

```typescript
interface AlternativeMove {
  position: Position;
  explanation: string;
  scoreDifference: number;  // 現在の手との差
}

// 例: 「この手より、d3に打つと角を狙えてもっと良いですよ」
```

#### 4.3 対局後の振り返り

- 対局全体の流れを時系列で説明
- ターニングポイントとなった手を特定
- 「ここでこう打っていれば勝てました」という分析

---

## ファイル構成

```
src/
├── lib/
│   └── moveExplanation.ts      # 説明生成ロジック
├── components/
│   └── SenseiComment.tsx       # 先生コメント表示
├── hooks/
│   └── useMoveExplanation.ts   # 説明取得用カスタムフック
└── constants/
    └── explanationTemplates.ts # 説明テンプレート定義
```

---

## 実装優先度

| 優先度 | 機能 | 工数目安 |
|-------|------|---------|
| **P0** | 評価要素の分解（Phase 1.1） | 小 |
| **P0** | 基本的な説明テンプレート（Phase 2.1） | 中 |
| **P1** | 先生コメントUI（Phase 3.1） | 中 |
| **P1** | 手を打った後の自動表示 | 小 |
| **P2** | ゲーム進行度による調整（Phase 2.2） | 中 |
| **P2** | 設定オプション（Phase 3.3） | 小 |
| **P3** | 代替手の提案（Phase 4.2） | 大 |
| **P3** | 対局後の振り返り（Phase 4.3） | 大 |

---

## 依存関係

- 評価関数（`src/lib/ai.ts`）: 既に7要素の評価が実装済み
- Issue #2（評価値表示機能）: 完了済み - 基盤として利用可能

---

## 期待される効果

1. **学習効果の向上**: なぜその手が良い/悪いのかを理解できる
2. **エンゲージメント向上**: 「先生」とのインタラクションでゲームがより楽しくなる
3. **アプリ名との一貫性**: 「Reversi Sensei」という名前に相応しい機能
4. **差別化**: 他のリバーシアプリにない独自機能
