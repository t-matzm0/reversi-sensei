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

      const newHistory = [...prev.history];
      const movesToUndo: Move[] = [];

      // 最後の手を取得
      const lastMove = newHistory.pop()!;

      // AI対戦の場合の処理
      if (lastMove.isAI) {
        // 最後の手がAIの手なら、AIの手と、その前の人間の手を両方取り消す
        // これにより、人間が打つ前の状態に戻る
        movesToUndo.push(lastMove);
        if (newHistory.length > 0 && !newHistory[newHistory.length - 1].isAI) {
          const humanMove = newHistory.pop()!;
          movesToUndo.push(humanMove);
        }
      } else {
        // 最後の手が人間の手の場合は、その手だけを取り消す
        // AIの手は残し、人間が別の手を試せるようにする
        movesToUndo.push(lastMove);
      }

      // ボードを復元（新しい手から順に取り消す）
      const newBoard = prev.board.map((row) => [...row]);
      for (const move of movesToUndo) {
        newBoard[move.row][move.col] = null;
        move.flippedPieces.forEach(({ row, col }) => {
          newBoard[row][col] = getOpponent(move.player);
        });
      }

      // 復元後の手番を決定（一番古い取り消した手のプレイヤー）
      const playerToMove = movesToUndo[movesToUndo.length - 1].player;

      const scores = countPieces(newBoard);
      const possibleMoves = getAllValidMoves(newBoard, playerToMove);

      // 前の手があれば、それをlastMoveとして設定
      const previousMove = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;
      setLastMove(previousMove ? { row: previousMove.row, col: previousMove.col } : undefined);

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
