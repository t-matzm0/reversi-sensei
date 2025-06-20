'use client';

import { useMemo } from 'react';
import { Board, Player, Position } from '@/types/game';
import { evaluateMove } from '@/lib/ai';

interface MoveEvaluation {
  position: Position;
  score: number;
  normalizedScore: number; // -100 to 100
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

    // Find min and max scores for normalization
    const minScore = Math.min(...scores.map((s) => s.score));
    const maxScore = Math.max(...scores.map((s) => s.score));
    const scoreRange = maxScore - minScore;

    // Normalize scores to -100 to 100 range
    scores.forEach(({ position, score }) => {
      let normalizedScore: number;
      
      if (scoreRange === 0) {
        // All scores are the same, show them as neutral (0)
        normalizedScore = 0;
      } else if (scoreRange < 10) {
        // Small range: show relative differences but keep them closer to 0
        const relativeScore = ((score - minScore) / scoreRange) * 50 - 25; // -25 to +25 range
        normalizedScore = Math.round(relativeScore);
      } else {
        // Normal range: use full -100 to +100 scale
        normalizedScore = Math.round(((score - minScore) / scoreRange) * 200 - 100);
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
