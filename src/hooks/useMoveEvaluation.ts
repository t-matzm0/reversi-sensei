'use client';

import { useState, useEffect } from 'react';
import { Board, Player, Position } from '@/types/game';
import { evaluateMove } from '@/lib/ai';

interface MoveEvaluation {
  position: Position;
  score: number;
  normalizedScore: number; // -100 to 100 (absolute evaluation)
}

export function useMoveEvaluation(
  board: Board,
  player: Player | null,
  possibleMoves: Position[],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Map<string, MoveEvaluation> {
  const [evaluations, setEvaluations] = useState<Map<string, MoveEvaluation>>(() => new Map());

  useEffect(() => {
    const newEvaluations = new Map<string, MoveEvaluation>();

    if (!player || possibleMoves.length === 0) {
      setEvaluations(newEvaluations);
      return;
    }

    // Calculate scores for all possible moves
    const scores = possibleMoves.map((move) => ({
      position: move,
      score: evaluateMove(board, move, player, difficulty),
    }));

    // 最大値と最小値を取得（相対的な差を計算するため）
    const maxScore = Math.max(...scores.map((s) => s.score));
    const minScore = Math.min(...scores.map((s) => s.score));
    const scoreRange = maxScore - minScore;

    // 評価値の差が小さい場合は全体的に0に近づける
    // 差が大きい場合は差を表示する
    // これにより、序盤（差が小さい）は0に近く、角が取れる場面（差が大きい）は明確に表示される
    const scalingFactor = Math.min(1, scoreRange / 100); // scoreRangeが100以上で完全表示

    scores.forEach(({ position, score }) => {
      let normalizedScore: number;

      // 勝敗確定
      if (Math.abs(score) >= 10000) {
        normalizedScore = score > 0 ? 100 : -100;
      } else if (scoreRange === 0) {
        // 全ての手が同じ評価
        normalizedScore = 0;
      } else {
        // 相対評価: 平均からの差分
        const avgScore = (maxScore + minScore) / 2;
        const diffFromAvg = score - avgScore;

        // 差分を-100〜100にスケーリング
        // scoreRangeが小さいほど、scalingFactorが小さくなり、0に近づく
        normalizedScore = Math.round(
          Math.max(-100, Math.min(100, (diffFromAvg / (scoreRange / 2)) * 100 * scalingFactor))
        );
      }

      const key = `${position.row}-${position.col}`;
      newEvaluations.set(key, {
        position,
        score,
        normalizedScore,
      });
    });

    setEvaluations(newEvaluations);
  }, [board, player, possibleMoves, difficulty]);

  return evaluations;
}
