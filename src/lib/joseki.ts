import { Position, Board, Move } from '@/types/game';

// 手の表記変換（例: "d3" → { row: 2, col: 3 }）
function parseMove(notation: string): Position {
  const col = notation.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = parseInt(notation[1]) - 1;
  return { row, col };
}

// 手の配列に変換
function parseMoves(notations: string[]): Position[] {
  return notations.map(parseMove);
}

export interface Joseki {
  name: string;
  japaneseName: string;
  moves: Position[];
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  characteristics: string[];
}

// 定石データベース
// 手順は黒から始まる（d3, c3, ... など）
export const JOSEKI_DATABASE: Joseki[] = [
  // 縦取り系
  {
    name: 'Tiger',
    japaneseName: '虎定石',
    moves: parseMoves(['d3', 'c5', 'd6', 'e3', 'c4', 'f5']),
    description: '攻撃的な定石で、序盤から激しい展開になりやすい',
    difficulty: 'intermediate',
    characteristics: ['攻撃的', '複雑な変化が多い', '中級者向け'],
  },
  {
    name: 'Cow',
    japaneseName: '牛定石',
    moves: parseMoves(['d3', 'c3', 'c4', 'c5', 'b3']),
    description: '安定した定石で、バランスの取れた展開になる',
    difficulty: 'beginner',
    characteristics: ['安定', 'バランス重視', '初心者向け'],
  },
  {
    name: 'Snake',
    japaneseName: '蛇定石',
    moves: parseMoves(['d3', 'c3', 'c4', 'c5', 'd6', 'e3']),
    description: '柔軟な定石で、様々な展開に対応できる',
    difficulty: 'intermediate',
    characteristics: ['柔軟', '変化に富む'],
  },
  {
    name: 'Rabbit',
    japaneseName: '兎定石',
    moves: parseMoves(['d3', 'c3', 'c4', 'c5', 'b4']),
    description: '素早い展開を目指す定石',
    difficulty: 'intermediate',
    characteristics: ['スピード重視', '端を狙う'],
  },
  {
    name: 'Mouse',
    japaneseName: 'ねずみ定石',
    moves: parseMoves(['d3', 'c3', 'c4', 'c5', 'b5']),
    description: '堅実な定石で、確実に石を増やしていく',
    difficulty: 'beginner',
    characteristics: ['堅実', '安全'],
  },
  // 斜め取り系
  {
    name: 'Diagonal Opening',
    japaneseName: '斜め取り',
    moves: parseMoves(['c4', 'c3', 'd3', 'c5', 'b3']),
    description: '斜めに展開する基本定石',
    difficulty: 'beginner',
    characteristics: ['基本', '覚えやすい'],
  },
  {
    name: 'Horse',
    japaneseName: '馬定石',
    moves: parseMoves(['c4', 'e3', 'f4', 'c5', 'd6']),
    description: '斜め取りからの攻撃的な変化',
    difficulty: 'intermediate',
    characteristics: ['攻撃的', '斜め取り系'],
  },
  // 並び取り系
  {
    name: 'Parallel Opening',
    japaneseName: '並び取り',
    moves: parseMoves(['e6', 'f4', 'c3', 'c4', 'd3']),
    description: '並行に展開する定石で、バランスを重視',
    difficulty: 'intermediate',
    characteristics: ['バランス', '中級者向け'],
  },
  {
    name: 'Rose',
    japaneseName: 'バラ定石',
    moves: parseMoves(['e6', 'f6', 'f5', 'f4', 'g5']),
    description: '並び取りからの華やかな変化',
    difficulty: 'advanced',
    characteristics: ['複雑', '上級者向け'],
  },
  // 縦取り基本
  {
    name: 'Perpendicular Opening',
    japaneseName: '縦取り',
    moves: parseMoves(['d3']),
    description: '最も一般的な初手。多くの定石がここから始まる',
    difficulty: 'beginner',
    characteristics: ['基本', '最も研究されている'],
  },
];

// 初手の分類
export const FIRST_MOVE_TYPES: { [key: string]: { name: string; description: string } } = {
  d3: { name: '縦取り', description: '最も一般的で研究が進んでいる初手' },
  c4: { name: '斜め取り', description: '斜めに展開する初手' },
  e6: { name: '並び取り', description: '並行に展開する初手' },
  f5: { name: '並び取り（対称）', description: '並び取りの対称形' },
};

export interface JosekiMatch {
  joseki: Joseki | null;
  matchLength: number; // 何手目まで定石に一致しているか
  isExactMatch: boolean; // 完全に定石通りか
  nextRecommendedMove: Position | null; // 定石の次の手
  deviation: number; // 定石から外れた手数（0なら定石通り）
}

// 現在の手順が定石に一致しているかチェック
export function matchJoseki(history: Move[]): JosekiMatch {
  if (history.length === 0) {
    return {
      joseki: null,
      matchLength: 0,
      isExactMatch: false,
      nextRecommendedMove: parseMoves(['d3'])[0], // 初手は縦取りを推奨
      deviation: 0,
    };
  }

  let bestMatch: JosekiMatch = {
    joseki: null,
    matchLength: 0,
    isExactMatch: false,
    nextRecommendedMove: null,
    deviation: history.length,
  };

  for (const joseki of JOSEKI_DATABASE) {
    let matchLength = 0;

    for (let i = 0; i < Math.min(history.length, joseki.moves.length); i++) {
      if (history[i].row === joseki.moves[i].row && history[i].col === joseki.moves[i].col) {
        matchLength++;
      } else {
        break;
      }
    }

    if (matchLength > bestMatch.matchLength) {
      const isExactMatch = matchLength === history.length;
      const nextMove =
        isExactMatch && joseki.moves.length > matchLength ? joseki.moves[matchLength] : null;

      bestMatch = {
        joseki: matchLength > 0 ? joseki : null,
        matchLength,
        isExactMatch,
        nextRecommendedMove: nextMove,
        deviation: history.length - matchLength,
      };
    }
  }

  return bestMatch;
}

// 次の手が定石に沿っているかチェック
export function isJosekiMove(history: Move[], nextMove: Position): boolean {
  const currentMatch = matchJoseki(history);

  if (!currentMatch.joseki || !currentMatch.isExactMatch) {
    // 現在定石から外れている場合、縦取りの初手かチェック
    if (history.length === 0) {
      return (
        (nextMove.row === 2 && nextMove.col === 3) || // d3
        (nextMove.row === 3 && nextMove.col === 2) || // c4
        (nextMove.row === 5 && nextMove.col === 4) || // e6
        (nextMove.row === 4 && nextMove.col === 5) // f5
      );
    }
    return false;
  }

  if (!currentMatch.nextRecommendedMove) {
    return false;
  }

  return (
    nextMove.row === currentMatch.nextRecommendedMove.row &&
    nextMove.col === currentMatch.nextRecommendedMove.col
  );
}

// 定石の説明を生成
export function getJosekiExplanation(history: Move[]): string | null {
  const match = matchJoseki(history);

  if (!match.joseki) {
    if (history.length === 0) {
      return '序盤です。縦取り(d3)、斜め取り(c4)、並び取り(e6)から選べます。';
    }
    return null;
  }

  if (match.isExactMatch) {
    const joseki = match.joseki;
    let explanation = `${joseki.japaneseName}の${match.matchLength}手目です。`;
    explanation += joseki.description;

    if (match.nextRecommendedMove) {
      const col = String.fromCharCode('a'.charCodeAt(0) + match.nextRecommendedMove.col);
      const row = match.nextRecommendedMove.row + 1;
      explanation += ` 次の定石手は${col}${row}です。`;
    }

    return explanation;
  } else {
    return `${match.joseki.japaneseName}から${match.deviation}手外れています。`;
  }
}

// ゲーム段階を判定
export type GamePhase = 'opening' | 'midgame' | 'endgame';

export function getGamePhase(board: Board): GamePhase {
  let pieceCount = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell !== null) {
        pieceCount++;
      }
    }
  }

  if (pieceCount <= 20) {
    return 'opening';
  } else if (pieceCount <= 50) {
    return 'midgame';
  } else {
    return 'endgame';
  }
}

// ゲーム段階に応じた戦略アドバイス
export function getPhaseAdvice(phase: GamePhase): string {
  switch (phase) {
    case 'opening':
      return '序盤: モビリティ（打てる場所の数）を重視し、相手の選択肢を減らしましょう。角の近くは避けましょう。';
    case 'midgame':
      return '中盤: 確定石を増やしながら、終盤に向けて有利な形を作りましょう。辺の確保も重要です。';
    case 'endgame':
      return '終盤: 石の数が重要になります。確実に取れる場所を見極め、最後の数手を読み切りましょう。';
  }
}
