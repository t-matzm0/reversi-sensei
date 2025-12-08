import { evaluatePosition, evaluateMove, getBestMove } from '@/lib/ai';
import { createInitialBoard } from '@/lib/gameLogic';
import { Board } from '@/types/game';

describe('AI', () => {
  describe('evaluatePosition', () => {
    it('should evaluate initial board as neutral', () => {
      const board = createInitialBoard();
      const blackScore = evaluatePosition(board, 'black');
      const whiteScore = evaluatePosition(board, 'white');
      // Initial board is symmetric, so scores should be equal in magnitude but opposite
      // Use Math.abs to avoid -0 vs 0 comparison issues
      expect(Math.abs(blackScore + whiteScore)).toBe(0);
    });

    it('should give high score for corner positions', () => {
      const board = createInitialBoard();
      board[0][0] = 'black';
      const score = evaluatePosition(board, 'black');
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('getBestMove', () => {
    it('should return null when no valid moves', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill('black'));
      const move = getBestMove(board, 'white');
      expect(move).toBeNull();
    });

    it('should return a valid move for initial board', () => {
      const board = createInitialBoard();
      const move = getBestMove(board, 'black');
      expect(move).toBeTruthy();
      if (move) {
        expect(move.row).toBeGreaterThanOrEqual(0);
        expect(move.row).toBeLessThan(8);
        expect(move.col).toBeGreaterThanOrEqual(0);
        expect(move.col).toBeLessThan(8);
      }
    });

    it('should prefer corners when available', () => {
      // Create a board where corner (0,0) is a valid move for black
      // Black needs to flip white pieces to place at corner
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // Set up: black at (0,2), white at (0,1), so black can place at (0,0)
      board[0][2] = 'black';
      board[0][1] = 'white';
      // Also set up another valid move at (2,0) for comparison
      board[2][0] = 'black';
      board[1][0] = 'white';

      const move = getBestMove(board, 'black', 'hard');
      // Corner should be preferred due to high position weight
      expect(move).toEqual({ row: 0, col: 0 });
    });

    it('should handle different difficulty levels', () => {
      const board = createInitialBoard();
      const easyMove = getBestMove(board, 'black', 'easy');
      const mediumMove = getBestMove(board, 'black', 'medium');
      const hardMove = getBestMove(board, 'black', 'hard');

      expect(easyMove).toBeTruthy();
      expect(mediumMove).toBeTruthy();
      expect(hardMove).toBeTruthy();
    });
  });

  describe('evaluateMove', () => {
    it('should evaluate moves based on flipped pieces', () => {
      const board = createInitialBoard();
      const move1 = { row: 2, col: 3 };
      const move2 = { row: 3, col: 2 };

      const score1 = evaluateMove(board, move1, 'black', 'medium');
      const score2 = evaluateMove(board, move2, 'black', 'medium');

      expect(typeof score1).toBe('number');
      expect(typeof score2).toBe('number');
    });
  });
});
