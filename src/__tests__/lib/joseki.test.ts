import {
  matchJoseki,
  isJosekiMove,
  getJosekiExplanation,
  getGamePhase,
  getPhaseAdvice,
} from '../../lib/joseki';
import { createInitialBoard } from '../../lib/gameLogic';
import { Move, Board } from '../../types/game';

describe('joseki', () => {
  describe('matchJoseki', () => {
    it('should recommend d3 as first move when history is empty', () => {
      const result = matchJoseki([]);
      expect(result.joseki).toBeNull();
      expect(result.nextRecommendedMove).toEqual({ row: 2, col: 3 }); // d3
      expect(result.deviation).toBe(0);
    });

    it('should match a joseki opening with d3', () => {
      const history: Move[] = [
        { row: 2, col: 3, player: 'black', flippedPieces: [] }, // d3
      ];
      const result = matchJoseki(history);
      expect(result.joseki).not.toBeNull();
      // d3 matches multiple joseki (虎定石, 牛定石, etc.), first one found wins
      expect(result.matchLength).toBe(1);
      expect(result.isExactMatch).toBe(true);
    });

    it('should match 牛定石 opening sequence', () => {
      const history: Move[] = [
        { row: 2, col: 3, player: 'black', flippedPieces: [] }, // d3
        { row: 2, col: 2, player: 'white', flippedPieces: [] }, // c3
        { row: 3, col: 2, player: 'black', flippedPieces: [] }, // c4
        { row: 4, col: 2, player: 'white', flippedPieces: [] }, // c5
        { row: 2, col: 1, player: 'black', flippedPieces: [] }, // b3
      ];
      const result = matchJoseki(history);
      expect(result.joseki).not.toBeNull();
      expect(result.joseki?.japaneseName).toBe('牛定石');
      expect(result.matchLength).toBe(5);
      expect(result.isExactMatch).toBe(true);
    });

    it('should detect deviation from joseki', () => {
      const history: Move[] = [
        { row: 2, col: 3, player: 'black', flippedPieces: [] }, // d3
        { row: 2, col: 2, player: 'white', flippedPieces: [] }, // c3
        { row: 5, col: 5, player: 'black', flippedPieces: [] }, // f6 (not joseki)
      ];
      const result = matchJoseki(history);
      expect(result.isExactMatch).toBe(false);
      expect(result.deviation).toBeGreaterThan(0);
    });
  });

  describe('isJosekiMove', () => {
    it('should return true for valid first moves', () => {
      expect(isJosekiMove([], { row: 2, col: 3 })).toBe(true); // d3
      expect(isJosekiMove([], { row: 3, col: 2 })).toBe(true); // c4
      expect(isJosekiMove([], { row: 5, col: 4 })).toBe(true); // e6
      expect(isJosekiMove([], { row: 4, col: 5 })).toBe(true); // f5
    });

    it('should return false for invalid first moves', () => {
      expect(isJosekiMove([], { row: 0, col: 0 })).toBe(false);
      expect(isJosekiMove([], { row: 4, col: 4 })).toBe(false);
    });

    it('should return true for joseki continuation', () => {
      const history: Move[] = [
        { row: 2, col: 3, player: 'black', flippedPieces: [] }, // d3
        { row: 2, col: 2, player: 'white', flippedPieces: [] }, // c3
        { row: 3, col: 2, player: 'black', flippedPieces: [] }, // c4
        { row: 4, col: 2, player: 'white', flippedPieces: [] }, // c5
      ];
      // Next joseki move for 牛定石 is b3
      expect(isJosekiMove(history, { row: 2, col: 1 })).toBe(true);
    });

    it('should return false when already deviated from joseki', () => {
      const history: Move[] = [
        { row: 2, col: 3, player: 'black', flippedPieces: [] }, // d3
        { row: 5, col: 5, player: 'white', flippedPieces: [] }, // f6 (deviation)
      ];
      expect(isJosekiMove(history, { row: 3, col: 2 })).toBe(false);
    });
  });

  describe('getJosekiExplanation', () => {
    it('should return opening advice when history is empty', () => {
      const explanation = getJosekiExplanation([]);
      expect(explanation).toContain('縦取り');
      expect(explanation).toContain('斜め取り');
    });

    it('should return joseki name and description when in joseki', () => {
      const history: Move[] = [
        { row: 2, col: 3, player: 'black', flippedPieces: [] }, // d3
      ];
      const explanation = getJosekiExplanation(history);
      // d3 matches multiple joseki, explanation should contain move count
      expect(explanation).toContain('1手目');
      expect(explanation).not.toBeNull();
    });

    it('should indicate deviation from joseki', () => {
      const history: Move[] = [
        { row: 2, col: 3, player: 'black', flippedPieces: [] }, // d3
        { row: 2, col: 2, player: 'white', flippedPieces: [] }, // c3
        { row: 5, col: 5, player: 'black', flippedPieces: [] }, // f6 (not joseki)
      ];
      const explanation = getJosekiExplanation(history);
      expect(explanation).toContain('外れています');
    });
  });

  describe('getGamePhase', () => {
    it('should return opening for initial board', () => {
      const board = createInitialBoard();
      expect(getGamePhase(board)).toBe('opening');
    });

    it('should return opening for boards with <= 20 pieces', () => {
      const board = createInitialBoard();
      // Initial board has 4 pieces, which is <= 20
      expect(getGamePhase(board)).toBe('opening');
    });

    it('should return midgame for boards with 21-50 pieces', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      // Fill 30 pieces
      for (let i = 0; i < 30; i++) {
        const row = Math.floor(i / 8);
        const col = i % 8;
        board[row][col] = i % 2 === 0 ? 'black' : 'white';
      }
      expect(getGamePhase(board)).toBe('midgame');
    });

    it('should return endgame for boards with > 50 pieces', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      // Fill 55 pieces
      for (let i = 0; i < 55; i++) {
        const row = Math.floor(i / 8);
        const col = i % 8;
        board[row][col] = i % 2 === 0 ? 'black' : 'white';
      }
      expect(getGamePhase(board)).toBe('endgame');
    });
  });

  describe('getPhaseAdvice', () => {
    it('should return opening advice', () => {
      const advice = getPhaseAdvice('opening');
      expect(advice).toContain('序盤');
      expect(advice).toContain('モビリティ');
    });

    it('should return midgame advice', () => {
      const advice = getPhaseAdvice('midgame');
      expect(advice).toContain('中盤');
      expect(advice).toContain('確定石');
    });

    it('should return endgame advice', () => {
      const advice = getPhaseAdvice('endgame');
      expect(advice).toContain('終盤');
      expect(advice).toContain('石の数');
    });
  });
});
