'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import GameBoard from './GameBoard';
import GameInfo from './GameInfo';
import { GameErrorBoundary } from './GameErrorBoundary';
import { Board } from '@/types/game';
import { useGameState, useGameSettings, useAIPlayer } from '@/hooks';
import { isValidMove, makeMove, getOpponent } from '@/lib/gameLogic';

export default function Game() {
  const { gameState, lastMove, setLastMove, updateGameState, resetGame } = useGameState();
  const { showHints, isVsComputer, difficulty, toggleHints, toggleGameMode, setDifficulty } =
    useGameSettings();

  const handleAIMove = useCallback(
    (board: Board, nextPlayer: 'black' | 'white', move: { row: number; col: number }) => {
      setLastMove(move);
      updateGameState(board, nextPlayer);
    },
    [setLastMove, updateGameState]
  );

  const { isThinking } = useAIPlayer({
    gameState,
    isVsComputer,
    difficulty,
    onMove: handleAIMove,
  });

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const { board, currentPlayer, gameOver } = gameState;

      if (gameOver || !currentPlayer || isThinking) {
        return;
      }

      if (isVsComputer && currentPlayer === 'white') {
        return;
      }

      if (!isValidMove(board, row, col, currentPlayer)) {
        return;
      }

      const newBoard = makeMove(board, row, col, currentPlayer);
      const nextPlayer = getOpponent(currentPlayer);

      setLastMove({ row, col });
      updateGameState(newBoard, nextPlayer);
    },
    [gameState, updateGameState, isVsComputer, isThinking, setLastMove]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-800">
          オセロ先生
        </h1>

        <div className="text-center mb-6">
          <Link
            href="/tutorial"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            戦略チュートリアル
          </Link>
        </div>

        <GameErrorBoundary onReset={resetGame}>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="relative">
              <GameBoard
                board={gameState.board}
                currentPlayer={gameState.currentPlayer}
                possibleMoves={gameState.possibleMoves}
                onCellClick={handleCellClick}
                showHints={showHints}
                lastMove={lastMove}
              />
            </div>

            <GameInfo
              currentPlayer={gameState.currentPlayer}
              blackScore={gameState.blackScore}
              whiteScore={gameState.whiteScore}
              gameOver={gameState.gameOver}
              winner={gameState.winner}
              onNewGame={resetGame}
              onToggleHints={toggleHints}
              showHints={showHints}
              isVsComputer={isVsComputer}
              difficulty={difficulty}
              onToggleGameMode={toggleGameMode}
              onDifficultyChange={setDifficulty}
              isThinking={isThinking}
            />
          </div>
        </GameErrorBoundary>
      </div>
    </div>
  );
}
