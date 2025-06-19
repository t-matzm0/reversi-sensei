import { useState, useCallback } from 'react';
import { Board, Player, Position, GameState } from '@/types/game';
import {
  createInitialBoard,
  getAllValidMoves,
  countPieces,
  isGameOver,
  getWinner,
  getOpponent,
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
  };
}
