import {
  createInitialBoard,
  isValidMove,
  getFlippedPieces,
  makeMove,
  getAllValidMoves,
  countPieces,
  isGameOver,
  getWinner,
  getOpponent,
} from '@/lib/gameLogic';
import { Board } from '@/types/game';

describe('gameLogic', () => {
  describe('createInitialBoard', () => {
    it('should create an 8x8 board with initial pieces', () => {
      const board = createInitialBoard();
      expect(board).toHaveLength(8);
      expect(board[0]).toHaveLength(8);
      expect(board[3][3]).toBe('white');
      expect(board[3][4]).toBe('black');
      expect(board[4][3]).toBe('black');
      expect(board[4][4]).toBe('white');
    });
  });

  describe('getOpponent', () => {
    it('should return the opposite player', () => {
      expect(getOpponent('black')).toBe('white');
      expect(getOpponent('white')).toBe('black');
    });
  });

  describe('isValidMove', () => {
    it('should return false for occupied cells', () => {
      const board = createInitialBoard();
      expect(isValidMove(board, 3, 3, 'black')).toBe(false);
    });

    it('should return true for valid moves', () => {
      const board = createInitialBoard();
      expect(isValidMove(board, 2, 3, 'black')).toBe(true);
      expect(isValidMove(board, 3, 2, 'black')).toBe(true);
    });

    it('should return false for moves that do not flip any pieces', () => {
      const board = createInitialBoard();
      expect(isValidMove(board, 0, 0, 'black')).toBe(false);
    });
  });

  describe('getFlippedPieces', () => {
    it('should return correct flipped pieces for a valid move', () => {
      const board = createInitialBoard();
      const flipped = getFlippedPieces(board, 2, 3, 'black');
      expect(flipped).toHaveLength(1);
      expect(flipped[0]).toEqual({ row: 3, col: 3 });
    });

    it('should return empty array for invalid moves', () => {
      const board = createInitialBoard();
      const flipped = getFlippedPieces(board, 0, 0, 'black');
      expect(flipped).toHaveLength(0);
    });
  });

  describe('makeMove', () => {
    it('should place piece and flip opponent pieces', () => {
      const board = createInitialBoard();
      const newBoard = makeMove(board, 2, 3, 'black');
      expect(newBoard[2][3]).toBe('black');
      expect(newBoard[3][3]).toBe('black'); // Flipped piece
    });
  });

  describe('getAllValidMoves', () => {
    it('should return all valid moves for initial board', () => {
      const board = createInitialBoard();
      const blackMoves = getAllValidMoves(board, 'black');
      const whiteMoves = getAllValidMoves(board, 'white');
      
      expect(blackMoves).toHaveLength(4);
      expect(whiteMoves).toHaveLength(4);
    });
  });

  describe('countPieces', () => {
    it('should count pieces correctly for initial board', () => {
      const board = createInitialBoard();
      const count = countPieces(board);
      expect(count.black).toBe(2);
      expect(count.white).toBe(2);
    });
  });

  describe('isGameOver', () => {
    it('should return false for initial board', () => {
      const board = createInitialBoard();
      expect(isGameOver(board)).toBe(false);
    });

    it('should return true when board is full', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill('black'));
      expect(isGameOver(board)).toBe(true);
    });
  });

  describe('getWinner', () => {
    it('should return null for tied game', () => {
      const board = createInitialBoard();
      expect(getWinner(board)).toBe(null);
    });

    it('should return winner with more pieces', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[0][0] = 'black';
      board[0][1] = 'black';
      board[0][2] = 'white';
      expect(getWinner(board)).toBe('black');
    });
  });
});