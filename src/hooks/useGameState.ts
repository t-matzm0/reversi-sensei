import { useState, useCallback } from 'react';
import { Board, Player, GameState, Move } from '@/types/game';
import {
  createInitialBoard,
  getAllValidMoves,
  countPieces,
  isGameOver,
  getWinner,
  getOpponent,
  getFlippedPieces,
  makeMove,
} from '@/lib/gameLogic';
import { INITIAL_SCORES } from '@/constants';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const board = createInitialBoard();
    return {
      board,
      currentPlayer: 'black',
      history: [],
      blackScore: INITIAL_SCORES.black,
      whiteScore: INITIAL_SCORES.white,
      gameOver: false,
      winner: null,
      possibleMoves: getAllValidMoves(board, 'black'),
      lastMove: undefined,
    };
  });

  const makeGameMove = useCallback(
    (oldBoard: Board, row: number, col: number, player: Player, isAI = false) => {
      // 古いボードからflippedPiecesを計算
      const flippedPieces = getFlippedPieces(oldBoard, row, col, player);
      // 新しいボードを作成
      const newBoard = makeMove(oldBoard, row, col, player);
      const move: Move = {
        row,
        col,
        player,
        flippedPieces,
        isAI,
      };

      // 次のプレイヤーを計算
      let nextPlayer = getOpponent(player);
      const scores = countPieces(newBoard);
      let possibleMoves = getAllValidMoves(newBoard, nextPlayer);

      // パス判定
      if (possibleMoves.length === 0) {
        const opponent = getOpponent(nextPlayer);
        const opponentMoves = getAllValidMoves(newBoard, opponent);
        if (opponentMoves.length > 0) {
          nextPlayer = opponent;
          possibleMoves = opponentMoves;
        }
      }

      const gameOver = isGameOver(newBoard);
      const winner = gameOver ? getWinner(newBoard) : null;

      // アトミックに全ての状態を更新
      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        currentPlayer: gameOver ? null : nextPlayer,
        history: [...prev.history, move],
        blackScore: scores.black,
        whiteScore: scores.white,
        gameOver,
        winner,
        possibleMoves: gameOver ? [] : possibleMoves,
        lastMove: { row, col },
      }));
    },
    []
  );

  const undoLastMove = useCallback(() => {
    setGameState((prev) => {
      if (prev.history.length === 0) {
        return prev;
      }

      const newHistory = [...prev.history];
      const movesToUndo: Move[] = [];

      // 最後の手を取得
      const lastMoveInHistory = newHistory.pop()!;

      // AI対戦の場合の処理
      if (lastMoveInHistory.isAI) {
        // 最後の手がAIの手なら、AIの手と、その前の人間の手を両方取り消す
        movesToUndo.push(lastMoveInHistory);
        if (newHistory.length > 0 && !newHistory[newHistory.length - 1].isAI) {
          const humanMove = newHistory.pop()!;
          movesToUndo.push(humanMove);
        }
      } else {
        // 最後の手が人間の手の場合は、その手だけを取り消す
        movesToUndo.push(lastMoveInHistory);
      }

      // ボードを復元（現在のボードから手を取り消す）
      const newBoard = prev.board.map((row) => [...row]);
      for (const move of movesToUndo) {
        // 置いた石を消す
        newBoard[move.row][move.col] = null;
        // ひっくり返した石を元に戻す
        for (const pos of move.flippedPieces) {
          newBoard[pos.row][pos.col] = getOpponent(move.player);
        }
      }

      // 復元後の手番を決定（一番古い取り消した手のプレイヤー）
      const playerToMove = movesToUndo[movesToUndo.length - 1].player;
      const scores = countPieces(newBoard);
      const possibleMoves = getAllValidMoves(newBoard, playerToMove);

      // 前の手を取得
      const previousMove = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;

      return {
        ...prev,
        board: newBoard,
        currentPlayer: playerToMove,
        history: newHistory,
        blackScore: scores.black,
        whiteScore: scores.white,
        gameOver: false,
        winner: null,
        possibleMoves,
        lastMove: previousMove ? { row: previousMove.row, col: previousMove.col } : undefined,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    const board = createInitialBoard();
    setGameState({
      board,
      currentPlayer: 'black',
      history: [],
      blackScore: INITIAL_SCORES.black,
      whiteScore: INITIAL_SCORES.white,
      gameOver: false,
      winner: null,
      possibleMoves: getAllValidMoves(board, 'black'),
      lastMove: undefined,
    });
  }, []);

  const setBoardState = useCallback((board: Board, currentPlayer: 'black' | 'white') => {
    const scores = countPieces(board);
    const possibleMoves = getAllValidMoves(board, currentPlayer);
    const gameOverResult = isGameOver(board);
    setGameState({
      board,
      currentPlayer: gameOverResult ? null : currentPlayer,
      history: [],
      blackScore: scores.black,
      whiteScore: scores.white,
      gameOver: gameOverResult,
      winner: gameOverResult ? getWinner(board) : null,
      possibleMoves: gameOverResult ? [] : possibleMoves,
      lastMove: undefined,
    });
  }, []);

  // 後方互換性のためlastMoveを別途返す
  const lastMove = gameState.lastMove;

  return {
    gameState,
    lastMove,
    resetGame,
    makeGameMove,
    undoLastMove,
    setBoardState,
  };
}
