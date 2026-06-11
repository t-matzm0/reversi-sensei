'use client';

import React, { useState } from 'react';
import { Board } from '@/types/game';
import GameBoard from './GameBoard';
import { createInitialBoard, isValidMove, makeMove } from '@/lib/gameLogic';
import { STRATEGY_EXAMPLES } from '@/lib/strategyExamples';

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
  {
    id: 'joseki-intro',
    title: '定石とは',
    description: '定石（じょうせき）は、序盤の最善手順として研究されてきた打ち方です。',
    board: createInitialBoard(),
    highlightPositions: [
      [2, 3],
      [3, 2],
      [4, 5],
      [5, 4],
    ],
    explanation:
      '初手は4つの選択肢がありますが、対称性を考えると「縦取り」と「斜め取り」の2種類に分類されます。定石を覚えることで、序盤を有利に進められます。',
  },
  {
    id: 'joseki-vertical',
    title: '縦取り（たてどり）',
    description: '最も一般的な初手で、多くの定石の基本となります。',
    board: (() => {
      let board = createInitialBoard();
      board = makeMove(board, 2, 3, 'black'); // d3
      return board;
    })(),
    highlightPositions: [[2, 3]],
    explanation:
      'd3（縦取り）は最もポピュラーな初手です。ここから虎定石、牛定石、蛇定石など様々な定石に分岐します。相手の応手によって最適な定石が変わります。',
  },
  {
    id: 'joseki-diagonal',
    title: '斜め取り（ななめどり）',
    description: 'もう一つの初手の選択肢で、異なる展開になります。',
    board: (() => {
      let board = createInitialBoard();
      board = makeMove(board, 4, 5, 'black'); // f5
      return board;
    })(),
    highlightPositions: [[4, 5]],
    explanation:
      'f5（斜め取り）は縦取りとは異なる展開になります。斜め取りからはバッファロー、ローズなど独自の定石があります。',
  },
  {
    id: 'joseki-tiger',
    title: '虎定石（とらじょうせき）',
    description: '攻撃的な定石で、序盤から激しい展開になりやすいです。',
    board: (() => {
      let board = createInitialBoard();
      board = makeMove(board, 2, 3, 'black'); // d3
      board = makeMove(board, 2, 2, 'white'); // c3
      board = makeMove(board, 3, 2, 'black'); // c4
      board = makeMove(board, 4, 2, 'white'); // c5
      board = makeMove(board, 5, 2, 'black'); // c6
      board = makeMove(board, 3, 5, 'white'); // f4
      return board;
    })(),
    highlightPositions: [
      [2, 3],
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
      [3, 5],
    ],
    explanation:
      '虎定石は縦取りから始まる代表的な定石です。白がc3と応じ、黒がc列を伸ばす展開になります。攻撃的で初心者にも覚えやすい定石です。',
  },
  {
    id: 'joseki-cow',
    title: '牛定石（うしじょうせき）',
    description: 'バランスの取れた定石で、安定した展開が期待できます。',
    board: (() => {
      let board = createInitialBoard();
      board = makeMove(board, 2, 3, 'black'); // d3
      board = makeMove(board, 2, 2, 'white'); // c3
      board = makeMove(board, 3, 2, 'black'); // c4
      board = makeMove(board, 4, 2, 'white'); // c5
      board = makeMove(board, 2, 1, 'black'); // b3
      return board;
    })(),
    highlightPositions: [
      [2, 3],
      [2, 2],
      [3, 2],
      [4, 2],
      [2, 1],
    ],
    explanation:
      '牛定石は虎定石と似た序盤ですが、黒がb3に打つことで異なる展開になります。バランスの良い定石で、中級者以上に人気があります。',
  },
  {
    id: 'joseki-tips',
    title: '定石を学ぶコツ',
    description: '定石を効果的に学ぶためのポイントを紹介します。',
    explanation:
      '1. まず1つの定石を完璧に覚える\n2. 相手が定石から外れた時の対応を考える\n3. 定石の狙いと理由を理解する\n4. 実戦で試して経験を積む\n\n定石を丸暗記するだけでなく、なぜその手が良いのかを理解することが大切です。ゲーム中のツールチップで定石情報が表示されるので、参考にしてください。',
  },
  // ===== 戦略概念の章 =====
  // 各例示盤面は strategyExamples.ts で定義され、ゲーム中の検出ロジックが
  // 実際に発火することをテストで保証している（説明と実動作の一貫性担保）
  {
    id: 'strategy-intro',
    title: '戦略概念を学ぼう',
    description: 'リバーシには名前のついた戦略概念がいくつもあります。',
    explanation:
      'ここからは「中割り」「ウイング」「偶数理論」「種石」「ストーナー」の5つの戦略概念を学びます。\n\nゲーム中に評価表示をONにして手の候補にカーソルを合わせると、その手に関係する戦略概念がツールチップに表示されます。✦は好手のサイン、▲は注意のサインです。',
  },
  {
    id: 'strategy-nakawari',
    title: '中割り（なかわり）',
    description: '相手の石を内側から返す、中盤の基本となる好手です。',
    board: STRATEGY_EXAMPLES.nakawari.board,
    highlightPositions: STRATEGY_EXAMPLES.nakawari.highlightPositions,
    explanation:
      'ハイライトされた空きマスに黒が打つと、返るのは内側の石だけです。外側に露出した石（境界石）が増えないため、相手に新しい打ち場所を与えにくく、自分の石も安定します。\n\n「外側ではなく内側の石を返す手を探す」のが中盤の基本です。',
  },
  {
    id: 'strategy-wing',
    title: 'ウイング',
    description: '辺の片側だけに伸びた石列は、角を取られる危険な形です。',
    board: STRATEGY_EXAMPLES.wing.board,
    highlightPositions: STRATEGY_EXAMPLES.wing.highlightPositions,
    explanation:
      'ハイライトの位置に黒が打つと、上辺の片側だけに3連の石列（ウイング）ができます。この形は空いている角（左上）を相手に取られるきっかけになりやすい弱い形です。\n\n自分がウイングを作るのは避け、逆に相手に作らせれば角を奪うチャンスになります。',
  },
  {
    id: 'strategy-parity',
    title: '偶数理論（ぐうすうりろん）',
    description: '終盤は空きマスの「偶数・奇数」が勝敗を左右します。',
    board: STRATEGY_EXAMPLES.parity.board,
    highlightPositions: STRATEGY_EXAMPLES.parity.highlightPositions,
    explanation:
      '終盤、盤面の空きマスはいくつかの「領域」に分かれます。ハイライトされた2つの領域はどちらも3マス（奇数）です。\n\n奇数空きの領域では最後に打った側がその領域の石を確定させやすく、有利になります。終盤は「奇数空きの領域を自分が最後に打てる形」を目指しましょう。',
  },
  {
    id: 'strategy-taneishi',
    title: '種石（たねいし）',
    description: '相手の石の中に残した自分の石は、後の大量取りの種になります。',
    board: STRATEGY_EXAMPLES.taneishi.board,
    highlightPositions: STRATEGY_EXAMPLES.taneishi.highlightPositions,
    explanation:
      'ハイライトの位置に黒が打つと、白に囲まれた拠点（種石）ができます。種石はあらゆる方向に白の石列が伸びているため、後でその先に打てば一度に大量の石を返せます。\n\n目先の石数は少なくても、種石を残しておくことが終盤の逆転につながります。',
  },
  {
    id: 'strategy-stoner',
    title: 'ストーナー',
    description: '空いた角に向かう相手の石列を攻めて、角を狙う戦術です。',
    board: STRATEGY_EXAMPLES.stoner.board,
    highlightPositions: STRATEGY_EXAMPLES.stoner.highlightPositions,
    explanation:
      '上辺の右側には空いた角に向かう白の石列があります。ハイライトの位置に黒が打って辺の石を返すと、この石列を足がかりに角を狙う攻めが成立します。\n\n辺に並んだ相手の石列と空き角のセットを見つけたら、ストーナーのチャンスです。ゲーム中のツールチップも参考に、実戦で試してみましょう。',
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
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{step.title}</h2>
        <p className="text-gray-800 dark:text-gray-100 mb-4">{step.description}</p>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line">
            {step.explanation}
          </p>
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
          <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
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
