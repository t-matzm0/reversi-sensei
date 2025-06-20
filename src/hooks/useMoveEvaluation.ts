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
      console.log('Debug: useMoveEvaluation early return', { player, possibleMovesLength: possibleMoves.length });
      return evaluations;
    }

    // Calculate scores for all possible moves
    const scores = possibleMoves.map((move) => ({
      position: move,
      score: evaluateMove(board, move, player, difficulty),
    }));

    console.log('Debug: calculated scores', { scores, difficulty, player });

    // Find min and max scores for normalization
    const minScore = Math.min(...scores.map((s) => s.score));
    const maxScore = Math.max(...scores.map((s) => s.score));
    const scoreRange = maxScore - minScore || 1; // Avoid division by zero
    
    console.log('Debug: score range', { minScore, maxScore, scoreRange });

    // Normalize scores to -100 to 100 range
    scores.forEach(({ position, score }) => {
      const normalizedScore =
        scoreRange === 0 ? 0 : Math.round(((score - minScore) / scoreRange) * 200 - 100);

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
