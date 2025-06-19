'use client';

import React, { useState } from 'react';
import { Board } from '@/types/game';
import GameBoard from './GameBoard';
import { createInitialBoard, isValidMove, makeMove } from '@/lib/gameLogic';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  board?: Board;
  highlightPositions?: [number, number][];
  targetMove?: [number, number];
  explanation: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'intro',
    title: 'オセロの基本ルール',
    description: 'オセロは8×8のボードで黒と白の石を使って遊ぶゲームです。',
    explanation:
      '相手の石を自分の石で挟むと、挟まれた石が自分の色に変わります。最終的に石が多い方が勝ちです。',
  },
  {
    id: 'corners',
    title: '角を狙う重要性',
    description: '角のマスは一度取ると相手に取り返されることがありません。',
    board: (() => {
      const board = createInitialBoard();
      return board;
    })(),
    highlightPositions: [
      [0, 0],
      [0, 7],
      [7, 0],
      [7, 7],
    ],
    explanation:
      '角（コーナー）は最も価値の高いマスです。角を取ることで、その辺全体をコントロールしやすくなります。',
  },
  {
    id: 'x-square',
    title: 'X打ちを避ける',
    description: '角の斜め隣（X打ち）は相手に角を取られやすい危険なマスです。',
    highlightPositions: [
      [1, 1],
      [1, 6],
      [6, 1],
      [6, 6],
    ],
    explanation:
      'X打ち（角の斜め隣）に石を置くと、相手が角を取りやすくなってしまいます。序盤〜中盤では避けるべきマスです。',
  },
  {
    id: 'c-square',
    title: 'C打ちの危険性',
    description: '角の隣（C打ち）も注意が必要なマスです。',
    highlightPositions: [
      [0, 1],
      [1, 0],
      [0, 6],
      [6, 0],
      [7, 1],
      [1, 7],
      [7, 6],
      [6, 7],
    ],
    explanation:
      'C打ち（角の隣）も、相手に角を取られる可能性があるため、慎重に打つ必要があります。',
  },
  {
    id: 'edge-control',
    title: '辺の確保',
    description: '辺を確保することで、安定した石を増やすことができます。',
    explanation:
      '辺の石は2方向からしか挟まれないため、内側の石より安定しています。辺を確保することは重要な戦略です。',
  },
  {
    id: 'mobility',
    title: '手数を確保する',
    description: '相手の打てる場所を減らし、自分の選択肢を増やすことが重要です。',
    explanation:
      '序盤〜中盤では、石の数よりも「打てる場所の数（手数）」が重要です。相手の手数を制限しながら、自分の手数を確保しましょう。',
  },
  {
    id: 'sacrifice',
    title: '少数戦略',
    description: '序盤〜中盤では、あえて石を少なく保つ戦略が有効です。',
    explanation:
      '石が少ない方が相手の打てる場所が減り、終盤で有利になることがあります。これを「少数戦略」と呼びます。',
  },
];

export default function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const showHints = true;

  const step = tutorialSteps[currentStep];

  const handleCellClick = (row: number, col: number) => {
    if (step.targetMove && step.targetMove[0] === row && step.targetMove[1] === col) {
      if (isValidMove(board, row, col, 'black')) {
        const newBoard = makeMove(board, row, col, 'black');
        setBoard(newBoard);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (tutorialSteps[currentStep + 1].board) {
        setBoard(tutorialSteps[currentStep + 1].board!);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (tutorialSteps[currentStep - 1].board) {
        setBoard(tutorialSteps[currentStep - 1].board!);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{step.description}</p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm">{step.explanation}</p>
        </div>
      </div>

      {(step.board || step.highlightPositions) && (
        <div className="mb-6">
          <GameBoard
            board={step.board || board}
            onCellClick={handleCellClick}
            currentPlayer={'black'}
            showHints={showHints}
            highlightPositions={step.highlightPositions}
            lastMove={null}
            possibleMoves={[]}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          前へ
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentStep + 1} / {tutorialSteps.length}
          </span>
        </div>

        <button
          onClick={nextStep}
          disabled={currentStep === tutorialSteps.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
