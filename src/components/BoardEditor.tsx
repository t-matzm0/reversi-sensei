'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Board, Player } from '@/types/game';
import { createInitialBoard, getAllValidMoves } from '@/lib/gameLogic';

interface BoardEditorProps {
  onApply: (board: Board, currentPlayer: 'black' | 'white') => void;
}

function nextCellState(current: Player): Player {
  if (current === null) return 'black';
  if (current === 'black') return 'white';
  return null;
}

function validateBoard(board: Board, player: 'black' | 'white'): string | null {
  let blackCount = 0;
  let whiteCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 'black') blackCount++;
      else if (board[r][c] === 'white') whiteCount++;
    }
  }
  const total = blackCount + whiteCount;

  if (total < 4) return '石が4個未満です（初期配置は4個）';
  if (blackCount === 0) return '黒の石がありません';
  if (whiteCount === 0) return '白の石がありません';

  // 連結チェック: すべての石が繋がっているか
  const visited = Array.from({ length: 8 }, () => Array(8).fill(false));
  let startR = -1;
  let startC = -1;
  for (let r = 0; r < 8 && startR === -1; r++) {
    for (let c = 0; c < 8 && startR === -1; c++) {
      if (board[r][c] !== null) {
        startR = r;
        startC = c;
      }
    }
  }
  const queue: [number, number][] = [[startR, startC]];
  visited[startR][startC] = true;
  let connected = 0;
  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    connected++;
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !visited[nr][nc] && board[nr][nc] !== null) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }
  if (connected !== total) return '石が分離しています（すべて繋がっている必要があります）';

  // 合法手チェック
  const moves = getAllValidMoves(board, player);
  const opponentMoves = getAllValidMoves(board, player === 'black' ? 'white' : 'black');
  if (moves.length === 0 && opponentMoves.length === 0)
    return 'どちらのプレイヤーも打てる場所がありません';

  return null;
}

function BoardEditor({ onApply }: BoardEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editBoard, setEditBoard] = useState<Board>(() =>
    createInitialBoard().map((row) => [...row])
  );
  const [editPlayer, setEditPlayer] = useState<'black' | 'white'>('black');
  const [error, setError] = useState<string | null>(null);
  const paintColorRef = useRef<Player | false>(false);

  const setCellAt = useCallback((row: number, col: number, color: Player) => {
    setEditBoard((prev) => {
      if (prev[row][col] === color) return prev;
      const next = prev.map((r) => [...r]);
      next[row][col] = color;
      return next;
    });
  }, []);

  const handlePointerDown = useCallback(
    (row: number, col: number) => {
      const color = nextCellState(editBoard[row][col]);
      paintColorRef.current = color;
      setCellAt(row, col, color);
    },
    [editBoard, setCellAt]
  );

  const handlePointerEnter = useCallback(
    (row: number, col: number) => {
      if (paintColorRef.current === false) return;
      setCellAt(row, col, paintColorRef.current);
    },
    [setCellAt]
  );

  const handlePointerUp = useCallback(() => {
    paintColorRef.current = false;
  }, []);

  const handleApply = useCallback(() => {
    const validationError = validateBoard(editBoard, editPlayer);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onApply(
      editBoard.map((row) => [...row]),
      editPlayer
    );
    setIsOpen(false);
  }, [editBoard, editPlayer, onApply]);

  const handleReset = useCallback(() => {
    setEditBoard(createInitialBoard().map((row) => [...row]));
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-sm"
      >
        盤面編集 (Dev)
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-xs">
      <h3 className="text-lg font-bold mb-3 text-gray-800">盤面編集</h3>
      <p className="text-xs text-gray-500 mb-3">クリックで 空→黒→白→空 / ドラッグで連続配置</p>

      <div
        className="inline-grid grid-cols-8 gap-0 border-2 border-gray-800 mb-3 select-none touch-none"
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {editBoard.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onPointerDown={() => handlePointerDown(r, c)}
              onPointerEnter={() => handlePointerEnter(r, c)}
              className="w-7 h-7 bg-board-green border border-green-800/30 flex items-center justify-center cursor-pointer"
            >
              {cell === 'black' && (
                <div className="w-5 h-5 bg-piece-black rounded-full pointer-events-none" />
              )}
              {cell === 'white' && (
                <div className="w-5 h-5 bg-piece-white rounded-full border border-gray-300 pointer-events-none" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-700 mb-1">手番</p>
        <div className="flex gap-2">
          <button
            onClick={() => setEditPlayer('black')}
            className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-colors ${
              editPlayer === 'black'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            黒
          </button>
          <button
            onClick={() => setEditPlayer('white')}
            className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-colors ${
              editPlayer === 'white'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            白
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium mb-2">{error}</p>}

      <div className="space-y-2">
        <button
          onClick={handleApply}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
        >
          この盤面でプレイ
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-1 px-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
          >
            初期盤面
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 py-1 px-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(BoardEditor);
