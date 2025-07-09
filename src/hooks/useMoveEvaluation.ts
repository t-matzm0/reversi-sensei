'use client';

import { useMemo } from 'react';
import { Board, Player, Position } from '@/types/game';
import { evaluateMove } from '@/lib/ai';

interface MoveEvaluation {
  position: Position;
  score: number;
  normalizedScore: number; // 0 to 100
}

export function useMoveEvaluation(
  board: Board,
  player: Player | null,
  possibleMoves: Position[],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Map<string, MoveEvaluation> {
  return useMemo(() => {
    const evaluations = new Map<string, MoveEvaluation>();

    if (!player || possibleMoves.length === 0) {
      return evaluations;
    }

    // Calculate scores for all possible moves
    const scores = possibleMoves.map((move) => ({
      position: move,
      score: evaluateMove(board, move, player, difficulty),
    }));

    // Calculate scores without normalization
    // We'll use absolute evaluation instead of relative

    // Normalize scores to display range
    // Instead of relative normalization (0-100), use absolute evaluation
    scores.forEach(({ position, score }) => {
      let normalizedScore: number;

      // Use absolute evaluation scale:
      // -100: Terrible move (will lose the game)
      // -50 to -100: Very bad move
      // -25 to -50: Bad move
      // -25 to 25: Neutral move
      // 25 to 50: Good move
      // 50 to 100: Very good move
      // 100: Winning move

      // Clamp the score to a reasonable range based on typical evaluation values
      // Typical scores range from -1000 to 1000 for normal moves
      // Corner moves can be around 200-500
      // Winning/losing positions are 10000/-10000
      if (Math.abs(score) >= 10000) {
        // Game-ending position
        normalizedScore = score > 0 ? 100 : -100;
      } else if (Math.abs(score) >= 1000) {
        // Extremely strong position
        normalizedScore = score > 0 ? 90 : -90;
      } else {
        // Normal positions: map score to -80 to 80 range
        // This preserves absolute evaluation while keeping display reasonable
        normalizedScore = Math.round(Math.max(-80, Math.min(80, score / 10)));
      }

      const key = `${position.row}-${position.col}`;
      evaluations.set(key, {
        position,
        score,
        normalizedScore,
      });
    });

    return evaluations;
  }, [board, player, possibleMoves, difficulty]);
}
