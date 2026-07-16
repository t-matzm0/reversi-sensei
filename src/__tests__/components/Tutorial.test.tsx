import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Tutorial from '@/components/Tutorial';
import { STRATEGY_EXAMPLES, StrategyExample } from '@/lib/strategyExamples';

// 例示盤面の黒石・白石の数を数える
function countPieces(example: StrategyExample): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (const row of example.board) {
    for (const cell of row) {
      if (cell === 'black') black++;
      else if (cell === 'white') white++;
    }
  }
  return { black, white };
}

describe('Tutorial', () => {
  it('should render the first step', () => {
    render(<Tutorial />);
    expect(screen.getByText('オセロの基本ルール')).toBeInTheDocument();
  });

  it('should navigate through all steps to the strategy chapter without crashing', () => {
    render(<Tutorial />);
    const nextButton = screen.getByText('次へ');

    // 戦略概念の章のステップ（タイトルと、表示される例示盤面）
    const strategySteps: { title: string; example: StrategyExample | null }[] = [
      { title: '戦略概念を学ぼう', example: null },
      { title: '中割り（なかわり）', example: STRATEGY_EXAMPLES.nakawari },
      { title: 'ウイング', example: STRATEGY_EXAMPLES.wing },
      { title: '偶数理論（ぐうすうりろん）', example: STRATEGY_EXAMPLES.parity },
      { title: '種石（たねいし）', example: STRATEGY_EXAMPLES.taneishi },
      { title: 'ストーナー', example: STRATEGY_EXAMPLES.stoner },
    ];

    // 最後のステップまで進みながら、戦略章のステップが順に表示されることを確認
    const seen: string[] = [];
    // 上限はステップ総数より十分大きい値（無限ループ防止）
    for (let i = 0; i < 30; i++) {
      const current = strategySteps.find(
        (s) => screen.queryByRole('heading', { name: s.title }) !== null
      );
      if (current && !seen.includes(current.title)) {
        seen.push(current.title);
        if (current.example) {
          // 盤面グリッドが64マス描画されている
          const grid = document.querySelector('.grid-cols-8.bg-black')!;
          expect(grid).not.toBeNull();
          expect(grid.children).toHaveLength(64);
          // 石の数が例示盤面の定義と一致する
          const expected = countPieces(current.example);
          expect(grid.querySelectorAll('.bg-piece-black')).toHaveLength(expected.black);
          expect(grid.querySelectorAll('.bg-piece-white')).toHaveLength(expected.white);
        }
      }
      if ((nextButton as HTMLButtonElement).disabled) break;
      fireEvent.click(nextButton);
    }

    // 6ステップすべてが順に表示された
    expect(seen).toEqual(strategySteps.map((s) => s.title));

    // 最終ステップ（ストーナー）が最後に表示されている
    expect(screen.getByRole('heading', { name: 'ストーナー' })).toBeInTheDocument();
  });

  it('should show progress with the total step count including strategy chapter', () => {
    render(<Tutorial />);
    // 13（既存） + 6（戦略章） = 19 ステップ
    expect(screen.getByText('1 / 19')).toBeInTheDocument();
  });
});
