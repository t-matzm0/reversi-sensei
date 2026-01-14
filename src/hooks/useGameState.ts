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
    };
  });

  const [lastMove, setLastMove] = useState<Position | undefined>();

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
      }));
      setLastMove({ row, col });
    },
    []
  );

  const undoLastMove = useCallback(() => {
    // 先に現在の状態を読み取って計算
    const currentHistory = gameState.history;
    if (currentHistory.length === 0) {
      return;
    }

    const newHistory = [...currentHistory];
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

    // ボードを復元
    const newBoard = gameState.board.map((row) => [...row]);
    for (const move of movesToUndo) {
      newBoard[move.row][move.col] = null;
      move.flippedPieces.forEach(({ row, col }) => {
        newBoard[row][col] = getOpponent(move.player);
      });
    }

    // 復元後の手番を決定
    const playerToMove = movesToUndo[movesToUndo.length - 1].player;
    const scores = countPieces(newBoard);
    const possibleMoves = getAllValidMoves(newBoard, playerToMove);

    // 前の手を取得
    const previousMove = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;

    // 状態を更新
    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      currentPlayer: playerToMove,
      history: newHistory,
      blackScore: scores.black,
      whiteScore: scores.white,
      gameOver: false,
      winner: null,
      possibleMoves,
    }));
    setLastMove(previousMove ? { row: previousMove.row, col: previousMove.col } : undefined);
  }, [gameState.history, gameState.board]);

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
    resetGame,
    makeGameMove,
    undoLastMove,
  };
}
