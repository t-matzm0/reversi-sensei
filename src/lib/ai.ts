import { Board, Position, Player } from '@/types/game';
import { getAllValidMoves, makeMove, countPieces, isGameOver, getWinner } from './gameLogic';
import { DIFFICULTY_SETTINGS } from '@/constants';

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

const CORNERS = [
  [0, 0],
  [0, 7],
  [7, 0],
  [7, 7],
];

// X打ち（角の斜め隣）
const X_SQUARES = [
  { pos: [1, 1], corner: [0, 0] },
  { pos: [1, 6], corner: [0, 7] },
  { pos: [6, 1], corner: [7, 0] },
  { pos: [6, 6], corner: [7, 7] },
];

// C打ち（角の隣）
const C_SQUARES = [
  { pos: [0, 1], corner: [0, 0] },
  { pos: [1, 0], corner: [0, 0] },
  { pos: [0, 6], corner: [0, 7] },
  { pos: [1, 7], corner: [0, 7] },
  { pos: [6, 0], corner: [7, 0] },
  { pos: [7, 1], corner: [7, 0] },
  { pos: [6, 7], corner: [7, 7] },
  { pos: [7, 6], corner: [7, 7] },
];

// 1. 石数差（Coin Parity）: -100 to 100
function coinParity(board: Board, player: Player): number {
  const { black, white } = countPieces(board);
  const myCoins = player === 'black' ? black : white;
  const oppCoins = player === 'black' ? white : black;
  if (myCoins + oppCoins === 0) return 0;
  return (100 * (myCoins - oppCoins)) / (myCoins + oppCoins);
}

// 2. モビリティ（Mobility）: -100 to 100
function mobility(board: Board, player: Player): number {
  const opponent = player === 'black' ? 'white' : 'black';
  const myMoves = getAllValidMoves(board, player).length;
  const oppMoves = getAllValidMoves(board, opponent).length;
  if (myMoves + oppMoves === 0) return 0;
  return (100 * (myMoves - oppMoves)) / (myMoves + oppMoves);
}

// 3. 角の占有（Corners Captured）: -100 to 100
function cornerOccupancy(board: Board, player: Player): number {
  const opponent = player === 'black' ? 'white' : 'black';
  let myCorners = 0;
  let oppCorners = 0;
  for (const [r, c] of CORNERS) {
    if (board[r][c] === player) myCorners++;
    else if (board[r][c] === opponent) oppCorners++;
  }
  if (myCorners + oppCorners === 0) return 0;
  return (100 * (myCorners - oppCorners)) / (myCorners + oppCorners);
}

// 4. 角の近接（Corner Closeness）: X打ち、C打ちのペナルティ
function cornerCloseness(board: Board, player: Player): number {
  const opponent = player === 'black' ? 'white' : 'black';
  let myBadMoves = 0;
  let oppBadMoves = 0;

  // X打ちのチェック（角が空いている場合のみペナルティ）
  for (const { pos, corner } of X_SQUARES) {
    if (board[corner[0]][corner[1]] === null) {
      if (board[pos[0]][pos[1]] === player)
        myBadMoves += 3; // X打ちは重いペナルティ
      else if (board[pos[0]][pos[1]] === opponent) oppBadMoves += 3;
    }
  }

  // C打ちのチェック（角が空いている場合のみペナルティ）
  for (const { pos, corner } of C_SQUARES) {
    if (board[corner[0]][corner[1]] === null) {
      if (board[pos[0]][pos[1]] === player) myBadMoves += 1;
      else if (board[pos[0]][pos[1]] === opponent) oppBadMoves += 1;
    }
  }

  // 相手のペナルティが多いほど自分に有利
  return (oppBadMoves - myBadMoves) * 12.5;
}

// 5. 確定石（Stability）
function stability(board: Board, player: Player): number {
  let myStable = 0;
  let oppStable = 0;

  // 角から始まる確定石をカウント
  for (const [cr, cc] of CORNERS) {
    const piece = board[cr][cc];
    if (piece === null) continue;

    const isMyPiece = piece === player;
    let count = 1;

    // 横方向
    const dx = cc === 0 ? 1 : -1;
    for (let c = cc + dx; c >= 0 && c < 8; c += dx) {
      if (board[cr][c] === piece) count++;
      else break;
    }

    // 縦方向
    const dy = cr === 0 ? 1 : -1;
    for (let r = cr + dy; r >= 0 && r < 8; r += dy) {
      if (board[r][cc] === piece) count++;
      else break;
    }

    if (isMyPiece) myStable += count;
    else oppStable += count;
  }

  if (myStable + oppStable === 0) return 0;
  return (100 * (myStable - oppStable)) / (myStable + oppStable);
}

// 6. 境界石（Frontier Discs）: 空きマスに隣接する石は危険
function frontierDiscs(board: Board, player: Player): number {
  const opponent = player === 'black' ? 'white' : 'black';
  let myFrontier = 0;
  let oppFrontier = 0;
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

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === null) continue;

      // 空きマスに隣接しているかチェック
      let isFrontier = false;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === null) {
          isFrontier = true;
          break;
        }
      }

      if (isFrontier) {
        if (board[r][c] === player) myFrontier++;
        else if (board[r][c] === opponent) oppFrontier++;
      }
    }
  }

  if (myFrontier + oppFrontier === 0) return 0;
  // 境界石が少ないほど良い
  return (100 * (oppFrontier - myFrontier)) / (myFrontier + oppFrontier);
}

// 7. 位置評価（Positional）
function positional(board: Board, player: Player): number {
  const opponent = player === 'black' ? 'white' : 'black';
  let myScore = 0;
  let oppScore = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === player) myScore += POSITION_WEIGHTS[r][c];
      else if (board[r][c] === opponent) oppScore += POSITION_WEIGHTS[r][c];
    }
  }

  return myScore - oppScore;
}

export function evaluatePosition(board: Board, player: Player): number {
  if (isGameOver(board)) {
    const winner = getWinner(board);
    if (winner === player) return 10000;
    if (winner === null) return 0;
    return -10000;
  }

  const { black, white } = countPieces(board);
  const totalPieces = black + white;
  const emptySquares = 64 - totalPieces;

  // 終盤（残り10マス以下）は石数のみで評価（完全読みに近い）
  if (emptySquares <= 10) {
    return coinParity(board, player) * 10;
  }

  // 各要素を計算
  const coin = coinParity(board, player);
  const mob = mobility(board, player);
  const corner = cornerOccupancy(board, player);
  const closeness = cornerCloseness(board, player);
  const stab = stability(board, player);
  const frontier = frontierDiscs(board, player);
  const pos = positional(board, player);

  // ゲーム段階に応じた重み付け（線形補間）
  // progress: 0 (序盤) → 1 (終盤)
  const progress = (totalPieces - 4) / 56;

  // 重み（研究に基づく標準的な値）
  // 序盤: モビリティ重視、石数無視
  // 終盤: 石数重視、モビリティ軽視
  const weights = {
    coin: progress * 25, // 序盤0 → 終盤25
    mobility: 78 * (1 - progress * 0.5), // 序盤78 → 終盤39
    corner: 801, // 常に高い
    closeness: 382, // 常に高い
    stability: 99 + progress * 100, // 序盤99 → 終盤199
    frontier: 74 * (1 - progress * 0.3), // 序盤74 → 終盤52
    positional: 10 * (1 - progress * 0.5), // 序盤10 → 終盤5
  };

  const score =
    weights.coin * coin +
    weights.mobility * mob +
    weights.corner * corner +
    weights.closeness * closeness +
    weights.stability * stab +
    weights.frontier * frontier +
    weights.positional * pos;

  // 正規化（大きな値になりすぎないように）
  return score / 100;
}

export function evaluateMove(
  board: Board,
  move: Position,
  player: Player,
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  const { row, col } = move;
  const newBoard = makeMove(board, row, col, player);

  if (difficulty === 'easy') {
    // Easyモード: 単純な評価 + ランダム性
    const baseScore = evaluatePosition(newBoard, player);
    return baseScore + Math.random() * 50 - 25;
  }

  // Medium/Hard: minimaxで先読み評価
  const depth = difficulty === 'medium' ? 3 : 5;
  const score = minimax(newBoard, depth, false, player, -Infinity, Infinity);

  return score;
}

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  player: Player,
  alpha: number = -Infinity,
  beta: number = Infinity
): number {
  if (depth === 0 || isGameOver(board)) {
    return evaluatePosition(board, player);
  }

  const currentPlayer = isMaximizing ? player : player === 'black' ? 'white' : 'black';
  const validMoves = getAllValidMoves(board, currentPlayer);

  if (validMoves.length === 0) {
    // パスの場合
    return minimax(board, depth - 1, !isMaximizing, player, alpha, beta);
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of validMoves) {
      const newBoard = makeMove(board, move.row, move.col, currentPlayer);
      const score = minimax(newBoard, depth - 1, false, player, alpha, beta);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // アルファベータ剪定
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of validMoves) {
      const newBoard = makeMove(board, move.row, move.col, currentPlayer);
      const score = minimax(newBoard, depth - 1, true, player, alpha, beta);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // アルファベータ剪定
    }
    return minScore;
  }
}

export function getBestMove(
  board: Board,
  player: Player,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Position | null {
  const validMoves = getAllValidMoves(board, player);

  if (validMoves.length === 0) return null;

  // Easy: ランダム性を含む
  if (difficulty === 'easy' && Math.random() < DIFFICULTY_SETTINGS.easy.randomness) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  const depth = DIFFICULTY_SETTINGS[difficulty].depth;
  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  // 各手を評価
  for (const move of validMoves) {
    const newBoard = makeMove(board, move.row, move.col, player);
    const score = minimax(newBoard, depth - 1, false, player);

    // ランダム性を追加（同じスコアの手からランダムに選択）
    if (score > bestScore || (score === bestScore && Math.random() < 0.5)) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
