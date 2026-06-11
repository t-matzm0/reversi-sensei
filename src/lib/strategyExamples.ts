import { Board, Position } from '@/types/game';
import { StrategyInfo } from './strategyDetection';

/**
 * チュートリアルで使用する戦略概念の例示盤面。
 *
 * 各例は「board（打つ前の盤面）+ move + player」のセットで、
 * 対応する検出関数（strategyDetection.ts）が実際に発火することを
 * strategyExamples.test.ts で保証している。
 * これにより、チュートリアルの説明とゲーム中のツールチップ表示が
 * 常に一貫することを担保する。
 */

export interface StrategyExample {
  type: StrategyInfo['type'];
  board: Board; // 打つ前の盤面
  move: Position; // 例示する手
  player: 'black' | 'white';
  highlightPositions: [number, number][]; // チュートリアルで強調するマス
}

// 文字列から盤面を生成（B=黒, W=白, .=空）
function boardFromRows(rows: string[]): Board {
  return rows.map((row) =>
    row.split('').map((ch) => (ch === 'B' ? 'black' : ch === 'W' ? 'white' : null))
  );
}

// 中割り: e5(4,4)に打つと内側の石(3,3)(3,4)(4,3)だけを返し、境界石が増えない
const NAKAWARI_EXAMPLE: StrategyExample = {
  type: 'nakawari',
  board: boardFromRows([
    '........',
    '........',
    '..BBBB..',
    '..BWWB..',
    '..BW.B..',
    '..BBBB..',
    '........',
    '........',
  ]),
  move: { row: 4, col: 4 },
  player: 'black',
  highlightPositions: [
    [4, 4], // 打つ場所
    [3, 3],
    [3, 4],
    [4, 3], // 返る内側の石
  ],
};

// ウイング: d1(0,3)に打つと上辺の片側だけに3連の石列ができる（弱い形）
const WING_EXAMPLE: StrategyExample = {
  type: 'wing',
  board: boardFromRows([
    '.BB.....',
    '...W....',
    '...B....',
    '...WB...',
    '...BW...',
    '........',
    '........',
    '........',
  ]),
  move: { row: 0, col: 3 },
  player: 'black',
  highlightPositions: [
    [0, 0], // 空いている角（取られる危険）
    [0, 1],
    [0, 2],
    [0, 3], // ウイングを構成する石列
  ],
};

// 偶数理論: 終盤、e5(4,4)に打つと奇数空き(3マス)の領域が2つ残る
const PARITY_EXAMPLE: StrategyExample = {
  type: 'parity',
  board: boardFromRows([
    '..WWWWWB',
    '.WWWWWWB',
    'WWWBBBWB',
    'WBWBWBWB',
    'WBBW.BWB',
    'WBWBWBWB',
    'WWBBWWB.',
    'BBBWWW..',
  ]),
  move: { row: 4, col: 4 },
  player: 'black',
  highlightPositions: [
    [0, 0],
    [0, 1],
    [1, 0], // 奇数空き領域A（3マス）
    [6, 7],
    [7, 6],
    [7, 7], // 奇数空き領域B（3マス）
  ],
};

// 種石: e5(4,4)に打つと相手の石に囲まれた拠点ができ、後で大量に返せる
const TANEISHI_EXAMPLE: StrategyExample = {
  type: 'taneishi',
  board: boardFromRows([
    '........',
    '........',
    '....B...',
    '...WWW..',
    '..WW.WW.',
    '...WWW..',
    '........',
    '........',
  ]),
  move: { row: 4, col: 4 },
  player: 'black',
  highlightPositions: [
    [4, 4], // 種石となる手
  ],
};

// ストーナー: e1(0,4)に打つと空き角(0,7)に向かう相手の石列(0,5)(0,6)を攻められる
const STONER_EXAMPLE: StrategyExample = {
  type: 'stoner',
  board: boardFromRows([
    '..BW.WW.',
    '....W...',
    '....B...',
    '...WB...',
    '...BW...',
    '........',
    '........',
    '........',
  ]),
  move: { row: 0, col: 4 },
  player: 'black',
  highlightPositions: [
    [0, 4], // 打つ場所
    [0, 5],
    [0, 6], // 攻められる相手の石列
    [0, 7], // 狙う角
  ],
};

export const STRATEGY_EXAMPLES: Record<StrategyInfo['type'], StrategyExample> = {
  nakawari: NAKAWARI_EXAMPLE,
  wing: WING_EXAMPLE,
  parity: PARITY_EXAMPLE,
  taneishi: TANEISHI_EXAMPLE,
  stoner: STONER_EXAMPLE,
};
