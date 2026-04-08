import { renderHook, act } from '@testing-library/react';
import { useGameState } from '@/hooks/useGameState';
import { Board } from '@/types/game';

describe('useGameState', () => {
  describe('makeGameMove', () => {
    it('should record flippedPieces correctly when making a move', () => {
      const { result } = renderHook(() => useGameState());

      // 初期状態を確認
      expect(result.current.gameState.history).toHaveLength(0);
      expect(result.current.gameState.board[3][3]).toBe('white');
      expect(result.current.gameState.board[3][4]).toBe('black');

      // 黒が(2,3)に手を打つ
      act(() => {
        result.current.makeGameMove(result.current.gameState.board, 2, 3, 'black', false);
      });

      // 履歴に手が記録されていることを確認
      expect(result.current.gameState.history).toHaveLength(1);
      const move = result.current.gameState.history[0];
      expect(move.row).toBe(2);
      expect(move.col).toBe(3);
      expect(move.player).toBe('black');

      // flippedPiecesが正しく記録されていることを確認
      expect(move.flippedPieces).toHaveLength(1);
      expect(move.flippedPieces[0]).toEqual({ row: 3, col: 3 });

      // ボードが正しく更新されていることを確認
      expect(result.current.gameState.board[2][3]).toBe('black');
      expect(result.current.gameState.board[3][3]).toBe('black'); // flipped
    });
  });

  describe('undoLastMove', () => {
    it('should restore board correctly after undoing a move', () => {
      const { result } = renderHook(() => useGameState());

      // 初期盤面をコピー
      const initialBoard = result.current.gameState.board.map((row) => [...row]);

      // 黒が(2,3)に手を打つ
      act(() => {
        result.current.makeGameMove(result.current.gameState.board, 2, 3, 'black', false);
      });

      // 手を取り消す
      act(() => {
        result.current.undoLastMove();
      });

      // 履歴が空になっていることを確認
      expect(result.current.gameState.history).toHaveLength(0);

      // ボードが初期状態に戻っていることを確認
      expect(result.current.gameState.board[2][3]).toBe(null);
      expect(result.current.gameState.board[3][3]).toBe('white');
      expect(result.current.gameState.board[3][4]).toBe('black');
      expect(result.current.gameState.board[4][3]).toBe('black');
      expect(result.current.gameState.board[4][4]).toBe('white');

      // 全体的に初期盤面と同じか確認
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(result.current.gameState.board[row][col]).toBe(initialBoard[row][col]);
        }
      }
    });

    it('should restore board correctly after undoing multiple moves (AI game)', () => {
      const { result } = renderHook(() => useGameState());

      // 初期盤面をコピー
      const initialBoard = result.current.gameState.board.map((row) => [...row]);

      // 黒（人間）が(2,3)に手を打つ
      act(() => {
        result.current.makeGameMove(result.current.gameState.board, 2, 3, 'black', false);
      });

      // 白（AI）が(2,2)に手を打つ
      act(() => {
        result.current.makeGameMove(result.current.gameState.board, 2, 2, 'white', true);
      });

      // 履歴を確認
      expect(result.current.gameState.history).toHaveLength(2);
      expect(result.current.gameState.history[0].isAI).toBe(false);
      expect(result.current.gameState.history[1].isAI).toBe(true);

      // 待ったを実行（AIの手が最後なので、AIと人間の両方の手を取り消す）
      act(() => {
        result.current.undoLastMove();
      });

      // 履歴が空になっていることを確認
      expect(result.current.gameState.history).toHaveLength(0);

      // ボードが初期状態に戻っていることを確認
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(result.current.gameState.board[row][col]).toBe(initialBoard[row][col]);
        }
      }
    });
  });

  describe('setBoardState', () => {
    it('should set a custom board and current player', () => {
      const { result } = renderHook(() => useGameState());

      // カスタム盤面を作成（角に黒、その隣に白）
      const customBoard: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
      customBoard[0][0] = 'black';
      customBoard[0][1] = 'white';
      customBoard[1][0] = 'white';

      act(() => {
        result.current.setBoardState(customBoard, 'white');
      });

      expect(result.current.gameState.board[0][0]).toBe('black');
      expect(result.current.gameState.board[0][1]).toBe('white');
      expect(result.current.gameState.board[1][0]).toBe('white');
      expect(result.current.gameState.currentPlayer).toBe('white');
      expect(result.current.gameState.blackScore).toBe(1);
      expect(result.current.gameState.whiteScore).toBe(2);
      expect(result.current.gameState.history).toHaveLength(0);
      expect(result.current.gameState.lastMove).toBeUndefined();
      expect(result.current.gameState.gameOver).toBe(false);
    });

    it('should detect game over when the board is full', () => {
      const { result } = renderHook(() => useGameState());

      // 全マス黒で埋める
      const fullBoard: Board = Array.from({ length: 8 }, () => Array(8).fill('black'));

      act(() => {
        result.current.setBoardState(fullBoard, 'white');
      });

      expect(result.current.gameState.gameOver).toBe(true);
      expect(result.current.gameState.winner).toBe('black');
      expect(result.current.gameState.currentPlayer).toBeNull();
      expect(result.current.gameState.possibleMoves).toHaveLength(0);
    });

    it('should calculate possibleMoves for the given player', () => {
      const { result } = renderHook(() => useGameState());

      // 初期配置と同じ盤面を手動で作成
      const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
      board[3][3] = 'white';
      board[3][4] = 'black';
      board[4][3] = 'black';
      board[4][4] = 'white';

      act(() => {
        result.current.setBoardState(board, 'black');
      });

      // 黒の合法手が計算されていることを確認
      expect(result.current.gameState.possibleMoves.length).toBeGreaterThan(0);
    });
  });
});
