import { Board, Position, Player } from '@/types/game';
import { getAllValidMoves, makeMove, countPieces, isGameOver, getWinner } from './gameLogic';
import { POSITION_WEIGHTS, DIFFICULTY_SETTINGS, BOARD_SIZE } from '@/constants';

export function evaluatePosition(board: Board, player: Player): number {
  if (isGameOver(board)) {
    const winner = getWinner(board);
    if (winner === player) return 10000;
    if (winner === null) return 0;
    return -10000;
  }

  let score = 0;
  const opponent = player === 'black' ? 'white' : 'black';
  const { black, white } = countPieces(board);
  const totalPieces = black + white;

  // 位置の重み
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === player) {
        score += POSITION_WEIGHTS[row][col];
      } else if (board[row][col] === opponent) {
        score -= POSITION_WEIGHTS[row][col];
      }
    }
  }

  // 有効手数（モビリティ）
  const playerMoves = getAllValidMoves(board, player).length;
  const opponentMoves = getAllValidMoves(board, opponent).length;
  const mobilityScore = (playerMoves - opponentMoves) * 10;

  // ゲームの進行度に応じて評価を調整
  if (totalPieces < 20) {
    // 序盤：位置とモビリティを重視
    score = score * 2 + mobilityScore * 3;
  } else if (totalPieces < 50) {
    // 中盤：バランスよく評価
    score = score + mobilityScore * 2;
  } else {
    // 終盤：石数を重視
    const pieceCount = player === 'black' ? black - white : white - black;
    score = score + pieceCount * 20 + mobilityScore;
  }

  return score;
}

export function evaluateMove(
  board: Board,
  move: Position,
  player: Player,
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  // const flippedCount = getFlippedPieces(board, move.row, move.col, player).length;

  if (difficulty === 'easy') {
    // Easy mode: simple evaluation with randomness
    const newBoard = makeMove(board, move.row, move.col, player);
    const baseScore = evaluatePosition(newBoard, player);
    return baseScore + Math.random() * 100 - 50; // Add randomness
  }

  // For medium and hard, use minimax for accurate evaluation
  const newBoard = makeMove(board, move.row, move.col, player);
  const depth = difficulty === 'medium' ? 2 : 3; // Shallower depth for display

  // Use minimax to get the actual evaluation
  const score = minimax(newBoard, depth, false, player);

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
