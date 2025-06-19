import { Board, Position, Player } from '@/types/game';
import { getAllValidMoves, makeMove, countPieces, getFlippedPieces } from './gameLogic';
import { POSITION_WEIGHTS, DIFFICULTY_SETTINGS, BOARD_SIZE } from '@/constants';
import { isCornerPosition, isEdgePosition } from '@/utils';


export function evaluatePosition(board: Board, player: Player): number {
  let score = 0;
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
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
    
    if (isCornerPosition(move)) {
      score += 200;
    }
    
    if (isEdgePosition(move)) {
      score += 50;
    }
    
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
  
  if (difficulty === 'easy' && Math.random() < DIFFICULTY_SETTINGS.easy.randomness) {
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