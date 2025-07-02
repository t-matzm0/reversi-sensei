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

    // Find min and max scores for normalization
    const minScore = Math.min(...scores.map((s) => s.score));
    const maxScore = Math.max(...scores.map((s) => s.score));
    const scoreRange = maxScore - minScore;

    // Normalize scores to -100 to 100 range
    // Positive values = good moves for current player
    // Negative values = bad moves for current player
    scores.forEach(({ position, score }) => {
      let normalizedScore: number;

      if (scoreRange === 0) {
        // All scores are the same, show them as neutral (0)
        normalizedScore = 0;
      } else {
        // Map to 0 to 100 range (always positive, higher is better)
        normalizedScore = Math.round(((score - minScore) / scoreRange) * 100);
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
