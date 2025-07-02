import { useState, useCallback } from 'react';
import { Board, Player, Position, GameState, Move } from '@/types/game';
import {
  createInitialBoard,
  getAllValidMoves,
  countPieces,
  isGameOver,
  getWinner,
  getOpponent,
  getFlippedPieces,
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
    };
  });

  const [lastMove, setLastMove] = useState<Position | undefined>();

  const updateGameState = useCallback((board: Board, nextPlayer: Player) => {
    const scores = countPieces(board);
    let possibleMoves = getAllValidMoves(board, nextPlayer);

    if (possibleMoves.length === 0) {
      const opponent = getOpponent(nextPlayer);
      const opponentMoves = getAllValidMoves(board, opponent);

      if (opponentMoves.length > 0) {
        nextPlayer = opponent;
        possibleMoves = opponentMoves;
      }
    }

    const gameOver = isGameOver(board);
    const winner = gameOver ? getWinner(board) : null;

    setGameState((prev) => ({
      ...prev,
      board,
      currentPlayer: gameOver ? null : nextPlayer,
      blackScore: scores.black,
      whiteScore: scores.white,
      gameOver,
      winner,
      possibleMoves: gameOver ? [] : possibleMoves,
    }));
  }, []);

  const addMoveToHistory = useCallback((move: Move) => {
    setGameState((prev) => ({
      ...prev,
      history: [...prev.history, move],
    }));
  }, []);

  const makeGameMove = useCallback(
    (board: Board, row: number, col: number, player: Player, isAI = false) => {
      const flippedPieces = getFlippedPieces(board, row, col, player);
      const move: Move = {
        row,
        col,
        player,
        flippedPieces,
        isAI,
      };
      addMoveToHistory(move);
      setLastMove({ row, col });

      const nextPlayer = getOpponent(player);
      updateGameState(board, nextPlayer);
    },
    [addMoveToHistory, setLastMove, updateGameState]
  );

  const undoLastMove = useCallback(() => {
    setGameState((prev) => {
      if (prev.history.length === 0) {
        return prev;
      }

      // 人間の手のみを取り消し対象とする
      const newHistory = [...prev.history];
      let lastMove = newHistory.pop()!;

      // 最後の手がAIの手なら、その前の人間の手を探す
      if (lastMove.isAI) {
        // AIの手は取り消さず、履歴に戻す
        newHistory.push(lastMove);

        // 人間の手を探す
        for (let i = newHistory.length - 1; i >= 0; i--) {
          if (!newHistory[i].isAI) {
            lastMove = newHistory[i];
            newHistory.splice(i, 1);
            break;
          }
        }

        // 人間の手が見つからない場合は何もしない
        if (lastMove.isAI) {
          return prev;
        }
      }

      // ボードを復元
      const newBoard = prev.board.map((row) => [...row]);
      newBoard[lastMove.row][lastMove.col] = null;

      // 反転された石を元に戻す
      lastMove.flippedPieces.forEach(({ row, col }) => {
        newBoard[row][col] = getOpponent(lastMove.player);
      });

      const scores = countPieces(newBoard);
      const possibleMoves = getAllValidMoves(newBoard, lastMove.player);

      // 前の手があれば、それをlastMoveとして設定
      const previousMove = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;
      setLastMove(previousMove ? { row: previousMove.row, col: previousMove.col } : undefined);

      return {
        ...prev,
        board: newBoard,
        currentPlayer: lastMove.player,
        history: newHistory,
        blackScore: scores.black,
        whiteScore: scores.white,
        gameOver: false,
        winner: null,
        possibleMoves,
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
    });
    setLastMove(undefined);
  }, []);

  return {
    gameState,
    lastMove,
    setLastMove,
    updateGameState,
    resetGame,
    makeGameMove,
    undoLastMove,
  };
}
