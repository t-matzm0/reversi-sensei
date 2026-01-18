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
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill('black'));
      expect(isGameOver(board)).toBe(true);
    });
  });

  describe('getWinner', () => {
    it('should return null for tied game', () => {
      const board = createInitialBoard();
      expect(getWinner(board)).toBe(null);
    });

    it('should return winner with more pieces', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[0][0] = 'black';
      board[0][1] = 'black';
      board[0][2] = 'white';
      expect(getWinner(board)).toBe('black');
    });
  });

  describe('undo move logic', () => {
    it('should be able to restore board after undoing a move', () => {
      // 初期盤面
      const initialBoard = createInitialBoard();

      // 黒が(2,3)に打つ - flippedPiecesを記録
      const flippedPieces = getFlippedPieces(initialBoard, 2, 3, 'black');
      expect(flippedPieces).toHaveLength(1);
      expect(flippedPieces[0]).toEqual({ row: 3, col: 3 });

      // 手を打つ
      const boardAfterMove = makeMove(initialBoard, 2, 3, 'black');
      expect(boardAfterMove[2][3]).toBe('black'); // 置いた石
      expect(boardAfterMove[3][3]).toBe('black'); // ひっくり返した石

      // 手を取り消す（undoLastMoveと同じロジック）
      const restoredBoard = boardAfterMove.map((row) => [...row]);
      // 置いた石を消す
      restoredBoard[2][3] = null;
      // ひっくり返した石を元に戻す
      for (const pos of flippedPieces) {
        restoredBoard[pos.row][pos.col] = getOpponent('black');
      }

      // 初期盤面と同じになるはず
      expect(restoredBoard[2][3]).toBe(null);
      expect(restoredBoard[3][3]).toBe('white');
      expect(restoredBoard[3][4]).toBe('black');
      expect(restoredBoard[4][3]).toBe('black');
      expect(restoredBoard[4][4]).toBe('white');
    });

    it('should be able to restore board after undoing multiple moves', () => {
      // 初期盤面
      const initialBoard = createInitialBoard();

      // 黒が(2,3)に打つ
      const blackFlipped = getFlippedPieces(initialBoard, 2, 3, 'black');
      const boardAfterBlack = makeMove(initialBoard, 2, 3, 'black');

      // 白が(2,2)に打つ
      const whiteFlipped = getFlippedPieces(boardAfterBlack, 2, 2, 'white');
      const boardAfterWhite = makeMove(boardAfterBlack, 2, 2, 'white');

      // 2手を取り消す（逆順で）
      const restoredBoard = boardAfterWhite.map((row) => [...row]);

      // 白の手を取り消す
      restoredBoard[2][2] = null;
      for (const pos of whiteFlipped) {
        restoredBoard[pos.row][pos.col] = getOpponent('white');
      }

      // 黒の手を取り消す
      restoredBoard[2][3] = null;
      for (const pos of blackFlipped) {
        restoredBoard[pos.row][pos.col] = getOpponent('black');
      }

      // 初期盤面と同じになるはず
      expect(restoredBoard[2][2]).toBe(null);
      expect(restoredBoard[2][3]).toBe(null);
      expect(restoredBoard[3][3]).toBe('white');
      expect(restoredBoard[3][4]).toBe('black');
      expect(restoredBoard[4][3]).toBe('black');
      expect(restoredBoard[4][4]).toBe('white');
    });
  });
});
