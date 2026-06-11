import { STRATEGY_EXAMPLES } from '@/lib/strategyExamples';
import {
  detectNakawari,
  detectWings,
  detectParity,
  detectTaneishi,
  detectStoner,
  detectAllStrategies,
} from '@/lib/strategyDetection';

/**
 * チュートリアルの例示盤面が、対応する検出ロジックを実際に発火させることを保証する。
 * このテストが通る限り、チュートリアルの説明とゲーム中のツールチップ表示は一貫する。
 */
describe('strategyExamples', () => {
  it('nakawari example should trigger detectNakawari (positive)', () => {
    const ex = STRATEGY_EXAMPLES.nakawari;
    const result = detectNakawari(ex.board, ex.move, ex.player);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('nakawari');
    expect(result!.isPositive).toBe(true);
  });

  it('wing example should trigger detectWings (negative for the player)', () => {
    const ex = STRATEGY_EXAMPLES.wing;
    const results = detectWings(ex.board, ex.move, ex.player);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === 'wing' && !r.isPositive)).toBe(true);
  });

  it('parity example should trigger detectParity (positive)', () => {
    const ex = STRATEGY_EXAMPLES.parity;
    const result = detectParity(ex.board, ex.move, ex.player);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('parity');
    expect(result!.isPositive).toBe(true);
  });

  it('taneishi example should trigger detectTaneishi (positive)', () => {
    const ex = STRATEGY_EXAMPLES.taneishi;
    const result = detectTaneishi(ex.board, ex.move, ex.player);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('taneishi');
    expect(result!.isPositive).toBe(true);
  });

  it('stoner example should trigger detectStoner (positive)', () => {
    const ex = STRATEGY_EXAMPLES.stoner;
    const result = detectStoner(ex.board, ex.move, ex.player);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('stoner');
    expect(result!.isPositive).toBe(true);
  });

  it('every example should be detected via detectAllStrategies', () => {
    for (const [type, ex] of Object.entries(STRATEGY_EXAMPLES)) {
      const detected = detectAllStrategies(ex.board, ex.move, ex.player);
      expect(detected.map((s) => s.type)).toContain(type);
    }
  });

  it('every example board should be 8x8', () => {
    for (const ex of Object.values(STRATEGY_EXAMPLES)) {
      expect(ex.board).toHaveLength(8);
      ex.board.forEach((row) => expect(row).toHaveLength(8));
    }
  });

  it('every example move cell should be empty before the move', () => {
    for (const ex of Object.values(STRATEGY_EXAMPLES)) {
      expect(ex.board[ex.move.row][ex.move.col]).toBeNull();
    }
  });
});
