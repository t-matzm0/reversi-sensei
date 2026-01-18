import { useEffect, useState } from 'react';
import { Board, GameState } from '@/types/game';
import { getBestMove } from '@/lib/ai';
import { AI_MOVE_DELAY } from '@/constants';
import { Difficulty } from './useGameSettings';

interface UseAIPlayerProps {
  gameState: GameState;
  isVsComputer: boolean;
  difficulty: Difficulty;
  onMove: (board: Board, nextPlayer: 'black' | 'white', move: { row: number; col: number }) => void;
}

export function useAIPlayer({ gameState, isVsComputer, difficulty, onMove }: UseAIPlayerProps) {
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (
      !isVsComputer ||
      gameState.gameOver ||
      !gameState.currentPlayer ||
      gameState.currentPlayer !== 'white'
    ) {
      return;
    }

    setIsThinking(true);
    const timer = setTimeout(() => {
      const aiMove = getBestMove(gameState.board, 'white', difficulty);
      if (aiMove) {
        // makeGameMoveが古いボードを受け取り、内部でmakeMoveを呼ぶ
        onMove(gameState.board, 'black', aiMove);
      }
      setIsThinking(false);
    }, AI_MOVE_DELAY);

    return () => clearTimeout(timer);
  }, [gameState, isVsComputer, difficulty, onMove]);

  return { isThinking };
}
