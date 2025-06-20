'use client';

import React from 'react';
import { Player } from '@/types/game';
import { Loading } from './Loading';

interface GameInfoProps {
  currentPlayer: Player;
  blackScore: number;
  whiteScore: number;
  gameOver: boolean;
  winner: Player;
  onNewGame: () => void;
  onToggleHints: () => void;
  onToggleEvaluations: () => void;
  showHints: boolean;
  showEvaluations: boolean;
  isVsComputer: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  onToggleGameMode: () => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  isThinking: boolean;
}

function GameInfo({
  currentPlayer,
  blackScore,
  whiteScore,
  gameOver,
  winner,
  onNewGame,
  onToggleHints,
  onToggleEvaluations,
  showHints,
  showEvaluations,
  isVsComputer,
  difficulty,
  onToggleGameMode,
  onDifficultyChange,
  isThinking,
}: GameInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
      <h2 className="text-2xl font-bold mb-4 text-center">ゲーム情報</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-piece-black rounded-full shadow-md" />
            <span className="font-semibold">黒</span>
          </div>
          <span className="text-2xl font-bold">{blackScore}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-piece-white rounded-full shadow-md border-2 border-gray-300" />
            <span className="font-semibold">白</span>
          </div>
          <span className="text-2xl font-bold">{whiteScore}</span>
        </div>
      </div>

      {!gameOver && currentPlayer && (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">現在のターン</p>
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-6 h-6 rounded-full shadow-md ${
                currentPlayer === 'black'
                  ? 'bg-piece-black'
                  : 'bg-piece-white border-2 border-gray-300'
              }`}
            />
            <span className="font-semibold">
              {currentPlayer === 'black' ? '黒' : '白'}
              {isVsComputer && currentPlayer === 'white' && ' (AI)'}
            </span>
          </div>
          {isThinking && (
            <div className="mt-3">
              <Loading message="AIが考え中..." size="small" />
            </div>
          )}
        </div>
      )}

      {gameOver && (
        <div className="mb-6 text-center">
          <p className="text-lg font-bold mb-2">ゲーム終了！</p>
          {winner ? (
            <div className="flex items-center justify-center gap-2">
              <div
                className={`w-6 h-6 rounded-full shadow-md ${
                  winner === 'black' ? 'bg-piece-black' : 'bg-piece-white border-2 border-gray-300'
                }`}
              />
              <span className="font-semibold">{winner === 'black' ? '黒' : '白'}の勝利！</span>
            </div>
          ) : (
            <p className="font-semibold">引き分け！</p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onNewGame}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          新しいゲーム
        </button>

        <button
          onClick={onToggleHints}
          className={`w-full py-2 px-4 rounded-lg transition-colors font-semibold ${
            showHints
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          ヒント: {showHints ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={onToggleEvaluations}
          className={`w-full py-2 px-4 rounded-lg transition-colors font-semibold ${
            showEvaluations
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          評価値: {showEvaluations ? 'ON' : 'OFF'}
        </button>

        <div className="border-t pt-3">
          <button
            onClick={onToggleGameMode}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold mb-3"
          >
            {isVsComputer ? 'AIと対戦中' : '人間同士で対戦'}
          </button>

          {isVsComputer && (
            <div>
              <p className="text-sm font-semibold mb-2">AI難易度</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onDifficultyChange('easy')}
                  className={`py-1 px-2 rounded text-sm font-medium transition-colors ${
                    difficulty === 'easy'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  簡単
                </button>
                <button
                  onClick={() => onDifficultyChange('medium')}
                  className={`py-1 px-2 rounded text-sm font-medium transition-colors ${
                    difficulty === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  普通
                </button>
                <button
                  onClick={() => onDifficultyChange('hard')}
                  className={`py-1 px-2 rounded text-sm font-medium transition-colors ${
                    difficulty === 'hard'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  難しい
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(GameInfo);
