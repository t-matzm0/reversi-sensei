'use client';

import React from 'react';
import { Board, Player, Position } from '@/types/game';

interface GameBoardProps {
  board: Board;
  currentPlayer: Player;
  possibleMoves?: Position[];
  onCellClick: (row: number, col: number) => void;
  showHints: boolean;
  showEvaluations?: boolean;
  moveEvaluations?: Map<string, { normalizedScore: number }>;
  lastMove?: Position | null;
  highlightPositions?: [number, number][];
}

function GameBoard({
  board,
  currentPlayer: _currentPlayer,
  possibleMoves = [],
  onCellClick,
  showHints,
  showEvaluations = false,
  moveEvaluations,
  lastMove,
  highlightPositions = [],
}: GameBoardProps) {
  const isPossibleMove = (row: number, col: number) => {
    return possibleMoves.some((move) => move.row === row && move.col === col);
  };

  const isLastMove = (row: number, col: number) => {
    return lastMove && lastMove.row === row && lastMove.col === col;
  };

  const isHighlighted = (row: number, col: number) => {
    return highlightPositions.some((pos) => pos[0] === row && pos[1] === col);
  };

  const getEvaluationScore = (row: number, col: number) => {
    if (!moveEvaluations) return null;
    const key = `${row}-${col}`;
    return moveEvaluations.get(key)?.normalizedScore ?? null;
  };

  const getEvaluationColor = (score: number) => {
    // -100から100の範囲で、高いほど良い手
    if (score >= 50) return 'text-white bg-green-600'; // 非常に良い手
    if (score >= 25) return 'text-white bg-green-500'; // 良い手
    if (score >= 0) return 'text-white bg-blue-500'; // やや良い手
    if (score >= -25) return 'text-white bg-orange-500'; // やや悪い手
    if (score >= -50) return 'text-white bg-red-500'; // 悪い手
    return 'text-white bg-red-700'; // 非常に悪い手
  };

  return (
    <div className="relative inline-block">
      <div className="grid grid-cols-8 gap-0 bg-black p-1 rounded-lg shadow-2xl">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                relative w-12 h-12 md:w-16 md:h-16 bg-board-green
                border border-black/20
                flex items-center justify-center
                cursor-pointer transition-all duration-200
                ${isPossibleMove(rowIndex, colIndex) ? 'hover:bg-green-600' : ''}
                ${isLastMove(rowIndex, colIndex) ? 'border-2 border-yellow-400' : ''}
                ${isHighlighted(rowIndex, colIndex) ? 'bg-yellow-200 dark:bg-yellow-800' : ''}
              `}
              onClick={() => onCellClick(rowIndex, colIndex)}
            >
              {cell && (
                <div
                  className={`
                    w-10 h-10 md:w-14 md:h-14 rounded-full
                    ${cell === 'black' ? 'bg-piece-black' : 'bg-piece-white'}
                    shadow-lg transform transition-all duration-300
                    animate-place
                  `}
                />
              )}
              {isPossibleMove(rowIndex, colIndex) &&
                !cell &&
                (() => {
                  const score = getEvaluationScore(rowIndex, colIndex);
                  const hasEvaluation = showEvaluations && score !== null;
                  const hasHint = showHints;

                  if (hasEvaluation) {
                    return (
                      <div
                        className={`absolute text-xs font-bold rounded px-1 py-0.5 ${getEvaluationColor(
                          score
                        )} shadow-sm border border-gray-300`}
                      >
                        {score}
                      </div>
                    );
                  } else if (hasHint) {
                    return (
                      <div className="absolute w-4 h-4 bg-yellow-400/70 rounded-full animate-pulse" />
                    );
                  }
                  return null;
                })()}
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-8 gap-0 absolute -top-6 left-0 w-full">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="text-center text-sm font-semibold text-gray-600">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      <div className="absolute -left-6 top-0 h-full flex flex-col">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center text-sm font-semibold text-gray-600"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(GameBoard, (prevProps, nextProps) => {
  return (
    prevProps.board === nextProps.board &&
    prevProps.currentPlayer === nextProps.currentPlayer &&
    prevProps.showHints === nextProps.showHints &&
    prevProps.showEvaluations === nextProps.showEvaluations &&
    prevProps.moveEvaluations === nextProps.moveEvaluations &&
    prevProps.lastMove === nextProps.lastMove &&
    JSON.stringify(prevProps.possibleMoves) === JSON.stringify(nextProps.possibleMoves) &&
    JSON.stringify(prevProps.highlightPositions) === JSON.stringify(nextProps.highlightPositions)
  );
});
