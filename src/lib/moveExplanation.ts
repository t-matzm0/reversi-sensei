import { Board, Position, Player } from '@/types/game';
import { getAllValidMoves, makeMove } from './gameLogic';

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
  const reasons: string[] = [];
  const risks: string[] = [];

  // 評価に基づくレーティング
  let rating: MoveExplanation['rating'];
  if (normalizedScore >= 50) rating = 'excellent';
  else if (normalizedScore >= 10) rating = 'good';
  else if (normalizedScore >= -10) rating = 'neutral';
  else if (normalizedScore >= -50) rating = 'bad';
  else rating = 'terrible';

  // 即時的な理由（良い点）
  if (breakdown.isCorner) {
    reasons.push('角を取れます！角は絶対に取られない確定石になります');
  }

  if (breakdown.opponentMobilityChange < -2) {
    reasons.push('相手の打てる場所を大きく減らせます');
  } else if (breakdown.opponentMobilityChange < 0) {
    reasons.push('相手の選択肢を減らせます');
  }

  if (breakdown.positionValue >= 10) {
    reasons.push('盤面の良い位置です');
  }

  if (breakdown.frontierDiscsChange < 0) {
    reasons.push('石が安定した位置に収まります');
  }

  // リスク（悪い点）
  if (breakdown.isXSquare && breakdown.cornerEmpty) {
    risks.push('X打ち（角の斜め隣）です。相手に角を取られる危険があります');
  }

  if (breakdown.isCSquare && breakdown.cornerEmpty) {
    risks.push('C打ち（角の隣）です。角を取られやすくなります');
  }

  if (breakdown.givesCornerToOpponent) {
    risks.push('この手を打つと、相手が角を取れるようになります');
  }

  if (breakdown.mobilityChange < -2) {
    risks.push('自分の打てる場所が大きく減ります');
  }

  if (breakdown.frontierDiscsChange > 2) {
    risks.push('取られやすい石（境界石）が増えます');
  }

  if (breakdown.positionValue < -5) {
    risks.push('あまり良くない位置です');
  }

  // 説明文の生成
  let immediate: string;
  if (reasons.length > 0) {
    immediate = reasons[0];
  } else if (risks.length > 0) {
    immediate = risks[0];
  } else {
    immediate = '普通の手です';
  }

  const risk = risks.length > 0 ? risks.join('。') : undefined;

  return { immediate, risk, rating };
}

export function getMoveExplanation(
  board: Board,
  move: Position,
  player: Player,
  normalizedScore: number
): MoveExplanation {
  const breakdown = analyzeMove(board, move, player);
  return generateExplanation(breakdown, normalizedScore);
}
