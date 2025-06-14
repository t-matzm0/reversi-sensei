'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import GameBoard from './GameBoard';
import GameInfo from './GameInfo';
import { Board, Player, Position, GameState } from '@/types/game';
import {
  createInitialBoard,
  isValidMove,
  makeMove,
  getAllValidMoves,
  countPieces,
  isGameOver,
  getWinner,
  getOpponent,
} from '@/lib/gameLogic';
import { getBestMove } from '@/lib/ai';

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const board = createInitialBoard();
    return {
      board,
      currentPlayer: 'black',
      history: [],
      blackScore: 2,
      whiteScore: 2,
      gameOver: false,
      winner: null,
      possibleMoves: getAllValidMoves(board, 'black'),
    };
  });

  const [showHints, setShowHints] = useState(true);
  const [lastMove, setLastMove] = useState<Position | undefined>();
  const [isVsComputer, setIsVsComputer] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isThinking, setIsThinking] = useState(false);

  const updateGameState = useCallback((board: Board, nextPlayer: Player) => {
    const scores = countPieces(board);
    const possibleMoves = getAllValidMoves(board, nextPlayer);
    
    if (possibleMoves.length === 0) {
      const opponent = getOpponent(nextPlayer);
      const opponentMoves = getAllValidMoves(board, opponent);
      
      if (opponentMoves.length > 0) {
        nextPlayer = opponent;
        possibleMoves.push(...opponentMoves);
      }
    }
    
    const gameOver = isGameOver(board);
    const winner = gameOver ? getWinner(board) : null;

    setGameState(prev => ({
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

  const handleCellClick = useCallback((row: number, col: number) => {
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
  }, [gameState, updateGameState, isVsComputer, isThinking]);

  const handleNewGame = useCallback(() => {
    const board = createInitialBoard();
    setGameState({
      board,
      currentPlayer: 'black',
      history: [],
      blackScore: 2,
      whiteScore: 2,
      gameOver: false,
      winner: null,
      possibleMoves: getAllValidMoves(board, 'black'),
    });
    setLastMove(undefined);
  }, []);

  const handleToggleHints = useCallback(() => {
    setShowHints(prev => !prev);
  }, []);

  useEffect(() => {
    if (!isVsComputer || gameState.gameOver || !gameState.currentPlayer || gameState.currentPlayer !== 'white') {
      return;
    }

    setIsThinking(true);
    const timer = setTimeout(() => {
      const aiMove = getBestMove(gameState.board, 'white', difficulty);
      if (aiMove) {
        const newBoard = makeMove(gameState.board, aiMove.row, aiMove.col, 'white');
        setLastMove(aiMove);
        updateGameState(newBoard, 'black');
      }
      setIsThinking(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, isVsComputer, difficulty, updateGameState]);

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            戦略チュートリアル
          </Link>
        </div>
        
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
            onNewGame={handleNewGame}
            onToggleHints={handleToggleHints}
            showHints={showHints}
            isVsComputer={isVsComputer}
            difficulty={difficulty}
            onToggleGameMode={() => setIsVsComputer(prev => !prev)}
            onDifficultyChange={setDifficulty}
            isThinking={isThinking}
          />
        </div>
      </div>
    </div>
  );
}