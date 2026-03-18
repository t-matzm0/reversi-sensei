import { Board, Position, Player, Move } from '@/types/game';
import { getAllValidMoves, makeMove } from './gameLogic';
import { isJosekiMove, matchJoseki, getGamePhase, getPhaseAdvice } from './joseki';
import { detectAllStrategies, StrategyInfo } from './strategyDetection';

// 位置評価テーブル
const POSITION_WEIGHTS = [
  [20, -3, 11, 8, 8, 11, -3, 20],
  [-3, -7, -4, 1, 1, -4, -7, -3],
  [11, -4, 2, 2, 2, 2, -4, 11],
  [8, 1, 2, -3, -3, 2, 1, 8],
  [8, 1, 2, -3, -3, 2, 1, 8],
  [11, -4, 2, 2, 2, 2, -4, 11],
  [-3, -7, -4, 1, 1, -4, -7, -3],
  [20, -3, 11, 8, 8, 11, -3, 20],
];

const CORNERS: [number, number][] = [
  [0, 0],
  [0, 7],
  [7, 0],
  [7, 7],
];

const X_SQUARES: { pos: [number, number]; corner: [number, number] }[] = [
  { pos: [1, 1], corner: [0, 0] },
  { pos: [1, 6], corner: [0, 7] },
  { pos: [6, 1], corner: [7, 0] },
  { pos: [6, 6], corner: [7, 7] },
];

const C_SQUARES: { pos: [number, number]; corner: [number, number] }[] = [
  { pos: [0, 1], corner: [0, 0] },
  { pos: [1, 0], corner: [0, 0] },
  { pos: [0, 6], corner: [0, 7] },
  { pos: [1, 7], corner: [0, 7] },
  { pos: [6, 0], corner: [7, 0] },
  { pos: [7, 1], corner: [7, 0] },
  { pos: [6, 7], corner: [7, 7] },
  { pos: [7, 6], corner: [7, 7] },
];

export interface EvaluationBreakdown {
  isCorner: boolean;
  isXSquare: boolean;
  isCSquare: boolean;
  cornerEmpty: boolean; // X打ち/C打ちの場合、対応する角が空いているか
  mobilityChange: number; // 自分のモビリティ変化
  opponentMobilityChange: number; // 相手のモビリティ変化
  givesCornerToOpponent: boolean; // 相手に角を与えるか
  stableDiscsGain: number; // 確定石の増加
  frontierDiscsChange: number; // 境界石の変化
  positionValue: number; // 位置の価値
}

export interface MoveExplanation {
  immediate: string; // 即時的な理由
  risk?: string; // リスク説明
  rating: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
  josekiInfo?: string; // 定石情報
  phaseAdvice?: string; // ゲーム段階アドバイス
  strategyInfo?: StrategyInfo[]; // 検出された戦略概念
}

function isCornerPosition(row: number, col: number): boolean {
  return CORNERS.some(([r, c]) => r === row && c === col);
}

function isXSquarePosition(
  row: number,
  col: number
): { isX: boolean; corner: [number, number] | null } {
  const found = X_SQUARES.find(({ pos }) => pos[0] === row && pos[1] === col);
  return { isX: !!found, corner: found?.corner ?? null };
}

function isCSquarePosition(
  row: number,
  col: number
): { isC: boolean; corner: [number, number] | null } {
  const found = C_SQUARES.find(({ pos }) => pos[0] === row && pos[1] === col);
  return { isC: !!found, corner: found?.corner ?? null };
}

function countMobility(board: Board, player: Player): number {
  return getAllValidMoves(board, player).length;
}

function checkGivesCornerToOpponent(board: Board, move: Position, player: Player): boolean {
  const newBoard = makeMove(board, move.row, move.col, player);
  const opponent = player === 'black' ? 'white' : 'black';
  const opponentMoves = getAllValidMoves(newBoard, opponent);

  return opponentMoves.some((m) => isCornerPosition(m.row, m.col));
}

function countFrontierDiscs(board: Board, player: Player): number {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  let count = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== player) continue;

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === null) {
          count++;
          break;
        }
      }
    }
  }
  return count;
}

export function analyzeMove(board: Board, move: Position, player: Player): EvaluationBreakdown {
  const opponent = player === 'black' ? 'white' : 'black';
  const newBoard = makeMove(board, move.row, move.col, player);

  // 角かどうか
  const isCorner = isCornerPosition(move.row, move.col);

  // X打ちかどうか
  const xSquareInfo = isXSquarePosition(move.row, move.col);
  const isXSquare = xSquareInfo.isX;
  let cornerEmptyForX = false;
  if (xSquareInfo.corner) {
    cornerEmptyForX = board[xSquareInfo.corner[0]][xSquareInfo.corner[1]] === null;
  }

  // C打ちかどうか
  const cSquareInfo = isCSquarePosition(move.row, move.col);
  const isCSquare = cSquareInfo.isC;
  let cornerEmptyForC = false;
  if (cSquareInfo.corner) {
    cornerEmptyForC = board[cSquareInfo.corner[0]][cSquareInfo.corner[1]] === null;
  }

  // モビリティの変化
  const currentMobility = countMobility(board, player);
  const newMobility = countMobility(newBoard, player);
  const currentOpponentMobility = countMobility(board, opponent);
  const newOpponentMobility = countMobility(newBoard, opponent);

  // 相手に角を与えるか
  const currentGivesCorner = getAllValidMoves(board, opponent).some((m) =>
    isCornerPosition(m.row, m.col)
  );
  const givesCornerToOpponent =
    !currentGivesCorner && checkGivesCornerToOpponent(board, move, player);

  // 境界石の変化
  const currentFrontier = countFrontierDiscs(board, player);
  const newFrontier = countFrontierDiscs(newBoard, player);

  // 位置の価値
  const positionValue = POSITION_WEIGHTS[move.row][move.col];

  return {
    isCorner,
    isXSquare,
    isCSquare,
    cornerEmpty: cornerEmptyForX || cornerEmptyForC,
    mobilityChange: newMobility - currentMobility,
    opponentMobilityChange: newOpponentMobility - currentOpponentMobility,
    givesCornerToOpponent,
    stableDiscsGain: 0, // 簡易実装では省略
    frontierDiscsChange: newFrontier - currentFrontier,
    positionValue,
  };
}

export function generateExplanation(
  breakdown: EvaluationBreakdown,
  normalizedScore: number
): MoveExplanation {
  const goodPoints: string[] = [];
  const badPoints: string[] = [];

  // 評価に基づくレーティング
  let rating: MoveExplanation['rating'];
  if (normalizedScore >= 50) rating = 'excellent';
  else if (normalizedScore >= 10) rating = 'good';
  else if (normalizedScore >= -10) rating = 'neutral';
  else if (normalizedScore >= -50) rating = 'bad';
  else rating = 'terrible';

  // 良い点を収集
  if (breakdown.isCorner) {
    goodPoints.push('角を取れます！確定石になります');
  }

  if (breakdown.opponentMobilityChange < -2) {
    goodPoints.push('相手の打てる場所を大きく減らせます');
  } else if (breakdown.opponentMobilityChange < 0) {
    goodPoints.push('相手の選択肢を減らせます');
  }

  if (breakdown.positionValue >= 10 && !breakdown.isCorner) {
    goodPoints.push('盤面の良い位置です');
  }

  if (breakdown.frontierDiscsChange < -1) {
    goodPoints.push('石が安定します');
  }

  // 悪い点を収集
  if (breakdown.isXSquare && breakdown.cornerEmpty) {
    badPoints.push('X打ちで角を取られる危険があります');
  }

  if (breakdown.isCSquare && breakdown.cornerEmpty) {
    badPoints.push('C打ちで角を取られやすくなります');
  }

  if (breakdown.givesCornerToOpponent) {
    badPoints.push('相手が角を取れるようになります');
  }

  if (breakdown.mobilityChange < -2) {
    badPoints.push('自分の選択肢が減ります');
  }

  if (breakdown.frontierDiscsChange > 2) {
    badPoints.push('取られやすい石が増えます');
  }

  if (breakdown.positionValue < -5 && !breakdown.isXSquare && !breakdown.isCSquare) {
    badPoints.push('位置が良くありません');
  }

  // 評価値に応じて説明を選択（矛盾を避ける）
  let immediate: string;
  let risk: string | undefined;

  if (rating === 'excellent' || rating === 'good') {
    // 良い評価の場合は良い点を優先
    if (goodPoints.length > 0) {
      immediate = goodPoints[0];
    } else {
      // 良い評価だが具体的な理由がない場合
      immediate = '有利な手です';
    }
    // 良い手でもリスクがある場合は補足として表示（ただし主説明と被らない）
    if (badPoints.length > 0) {
      risk = badPoints.join('。');
    }
  } else if (rating === 'bad' || rating === 'terrible') {
    // 悪い評価の場合は悪い点を優先
    if (badPoints.length > 0) {
      immediate = badPoints[0];
      // 残りの悪い点を補足に（重複を避ける）
      const remainingBad = badPoints.slice(1);
      if (remainingBad.length > 0) {
        risk = remainingBad.join('。');
      }
    } else {
      // 悪い評価だが具体的な理由がない場合
      immediate = '不利になりやすい手です';
    }
  } else {
    // 中立の場合
    if (goodPoints.length > 0 && badPoints.length > 0) {
      immediate = goodPoints[0];
      risk = badPoints[0];
    } else if (goodPoints.length > 0) {
      immediate = goodPoints[0];
    } else if (badPoints.length > 0) {
      immediate = badPoints[0];
    } else {
      immediate = '普通の手です';
    }
  }

  return { immediate, risk, rating };
}

export function getMoveExplanation(
  board: Board,
  move: Position,
  player: Player,
  normalizedScore: number,
  history?: Move[]
): MoveExplanation {
  const breakdown = analyzeMove(board, move, player);
  const explanation = generateExplanation(breakdown, normalizedScore);

  // ゲーム段階に応じたアドバイス
  const phase = getGamePhase(board);
  explanation.phaseAdvice = getPhaseAdvice(phase);

  // 戦略概念の検出
  const strategies = detectAllStrategies(board, move, player);
  if (strategies.length > 0) {
    explanation.strategyInfo = strategies;
  }

  // 定石情報（序盤のみ）
  if (history && phase === 'opening') {
    const isJoseki = isJosekiMove(history, move);
    const match = matchJoseki(history);

    if (isJoseki) {
      if (match.joseki) {
        explanation.josekiInfo = `定石手: ${match.joseki.japaneseName}の手順です`;
      } else {
        explanation.josekiInfo = '定石の初手です';
      }
    } else if (match.joseki && match.isExactMatch && match.nextRecommendedMove) {
      const recCol = String.fromCharCode('a'.charCodeAt(0) + match.nextRecommendedMove.col);
      const recRow = match.nextRecommendedMove.row + 1;
      explanation.josekiInfo = `定石では${recCol}${recRow}が推奨されます`;
    }
  }

  return explanation;
}
