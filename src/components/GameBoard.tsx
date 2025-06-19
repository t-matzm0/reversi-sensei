'use client';

import React from 'react';
import { Board, Player, Position } from '@/types/game';

interface GameBoardProps {
  board: Board;
  currentPlayer: Player;
  possibleMoves?: Position[];
  onCellClick: (row: number, col: number) => void;
  showHints: boolean;
  lastMove?: Position | null;
  highlightPositions?: [number, number][];
}

function GameBoard({
  board,
  currentPlayer: _currentPlayer,
  possibleMoves = [],
  onCellClick,
  showHints,
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
                ${isLastMove(rowIndex, colIndex) ? 'ring-2 ring-yellow-400' : ''}
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
              {showHints && isPossibleMove(rowIndex, colIndex) && !cell && (
                <div className="absolute w-3 h-3 bg-yellow-400/50 rounded-full animate-pulse" />
              )}
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
    prevProps.lastMove === nextProps.lastMove &&
    JSON.stringify(prevProps.possibleMoves) === JSON.stringify(nextProps.possibleMoves) &&
    JSON.stringify(prevProps.highlightPositions) === JSON.stringify(nextProps.highlightPositions)
  );
});
