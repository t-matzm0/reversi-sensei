import { Board, Position, Player } from '@/types/game';
import { getAllValidMoves, makeMove, countPieces, getFlippedPieces } from './gameLogic';

const CORNER_POSITIONS = [
  { row: 0, col: 0 }, { row: 0, col: 7 },
  { row: 7, col: 0 }, { row: 7, col: 7 }
];

const EDGE_POSITIONS = [
  ...Array.from({ length: 6 }, (_, i) => ({ row: 0, col: i + 1 })),
  ...Array.from({ length: 6 }, (_, i) => ({ row: 7, col: i + 1 })),
  ...Array.from({ length: 6 }, (_, i) => ({ row: i + 1, col: 0 })),
  ...Array.from({ length: 6 }, (_, i) => ({ row: i + 1, col: 7 })),
];

const POSITION_WEIGHTS = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [ 10,  -2,  -1,  -1,  -1,  -1,  -2,  10],
  [  5,  -2,  -1,  -1,  -1,  -1,  -2,   5],
  [  5,  -2,  -1,  -1,  -1,  -1,  -2,   5],
  [ 10,  -2,  -1,  -1,  -1,  -1,  -2,  10],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [100, -20,  10,   5,   5,  10, -20, 100],
];

export function evaluatePosition(board: Board, player: Player): number {
  let score = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === player) {
        score += POSITION_WEIGHTS[row][col];
      } else if (board[row][col] !== null) {
        score -= POSITION_WEIGHTS[row][col];
      }
    }
  }
  
  return score;
}

export function evaluateMove(
  board: Board,
  move: Position,
  player: Player,
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  const flippedCount = getFlippedPieces(board, move.row, move.col, player).length;
  
  if (difficulty === 'easy') {
    return Math.random() * 10 + flippedCount;
  }
  
  const newBoard = makeMove(board, move.row, move.col, player);
  let score = evaluatePosition(newBoard, player);
  
  if (difficulty === 'medium') {
    score += flippedCount * 10;
  } else if (difficulty === 'hard') {
    score += flippedCount * 5;
    
    const isCorner = CORNER_POSITIONS.some(
      corner => corner.row === move.row && corner.col === move.col
    );
    if (isCorner) score += 200;
    
    const isEdge = EDGE_POSITIONS.some(
      edge => edge.row === move.row && edge.col === move.col
    );
    if (isEdge) score += 50;
    
    const { black, white } = countPieces(newBoard);
    const totalPieces = black + white;
    if (totalPieces < 20) {
      score -= (player === 'black' ? black : white) * 2;
    } else if (totalPieces > 50) {
      score += (player === 'black' ? black : white) * 5;
    }
  }
  
  return score;
}

export function getBestMove(
  board: Board,
  player: Player,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Position | null {
  const validMoves = getAllValidMoves(board, player);
  
  if (validMoves.length === 0) return null;
  
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  let bestMove = validMoves[0];
  let bestScore = -Infinity;
  
  for (const move of validMoves) {
    const score = evaluateMove(board, move, player, difficulty);
    
    if (score > bestScore || (score === bestScore && Math.random() < 0.5)) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}