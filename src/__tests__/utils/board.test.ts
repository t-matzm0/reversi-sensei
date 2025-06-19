import {
  isCornerPosition,
  isEdgePosition,
  getAdjacentPositions,
  isValidPosition,
  positionToString,
  stringToPosition,
  getBoardSymmetry,
} from '@/utils/board';

describe('board utilities', () => {
  describe('isCornerPosition', () => {
    it('should identify corner positions correctly', () => {
      expect(isCornerPosition({ row: 0, col: 0 })).toBe(true);
      expect(isCornerPosition({ row: 0, col: 7 })).toBe(true);
      expect(isCornerPosition({ row: 7, col: 0 })).toBe(true);
      expect(isCornerPosition({ row: 7, col: 7 })).toBe(true);
      expect(isCornerPosition({ row: 3, col: 3 })).toBe(false);
    });
  });

  describe('isEdgePosition', () => {
    it('should identify edge positions correctly', () => {
      expect(isEdgePosition({ row: 0, col: 3 })).toBe(true);
      expect(isEdgePosition({ row: 7, col: 4 })).toBe(true);
      expect(isEdgePosition({ row: 3, col: 0 })).toBe(true);
      expect(isEdgePosition({ row: 4, col: 7 })).toBe(true);
      expect(isEdgePosition({ row: 3, col: 3 })).toBe(false);
    });

    it('should not count corners as edges', () => {
      expect(isEdgePosition({ row: 0, col: 0 })).toBe(false);
      expect(isEdgePosition({ row: 7, col: 7 })).toBe(false);
    });
  });

  describe('isValidPosition', () => {
    it('should validate positions within board bounds', () => {
      expect(isValidPosition(0, 0)).toBe(true);
      expect(isValidPosition(7, 7)).toBe(true);
      expect(isValidPosition(3, 4)).toBe(true);
      expect(isValidPosition(-1, 0)).toBe(false);
      expect(isValidPosition(0, -1)).toBe(false);
      expect(isValidPosition(8, 0)).toBe(false);
      expect(isValidPosition(0, 8)).toBe(false);
    });
  });

  describe('getAdjacentPositions', () => {
    it('should return 8 adjacent positions for center cell', () => {
      const adjacent = getAdjacentPositions(3, 3);
      expect(adjacent).toHaveLength(8);
      expect(adjacent).toContainEqual({ row: 2, col: 2 });
      expect(adjacent).toContainEqual({ row: 2, col: 3 });
      expect(adjacent).toContainEqual({ row: 2, col: 4 });
      expect(adjacent).toContainEqual({ row: 3, col: 2 });
      expect(adjacent).toContainEqual({ row: 3, col: 4 });
      expect(adjacent).toContainEqual({ row: 4, col: 2 });
      expect(adjacent).toContainEqual({ row: 4, col: 3 });
      expect(adjacent).toContainEqual({ row: 4, col: 4 });
    });

    it('should return 3 adjacent positions for corner cell', () => {
      const adjacent = getAdjacentPositions(0, 0);
      expect(adjacent).toHaveLength(3);
      expect(adjacent).toContainEqual({ row: 0, col: 1 });
      expect(adjacent).toContainEqual({ row: 1, col: 0 });
      expect(adjacent).toContainEqual({ row: 1, col: 1 });
    });

    it('should return 5 adjacent positions for edge cell', () => {
      const adjacent = getAdjacentPositions(0, 3);
      expect(adjacent).toHaveLength(5);
    });
  });

  describe('positionToString and stringToPosition', () => {
    it('should convert between position and string notation', () => {
      expect(positionToString({ row: 0, col: 0 })).toBe('a1');
      expect(positionToString({ row: 7, col: 7 })).toBe('h8');
      expect(positionToString({ row: 3, col: 4 })).toBe('e4');
      
      expect(stringToPosition('a1')).toEqual({ row: 0, col: 0 });
      expect(stringToPosition('h8')).toEqual({ row: 7, col: 7 });
      expect(stringToPosition('e4')).toEqual({ row: 3, col: 4 });
    });

    it('should handle invalid string notation', () => {
      expect(stringToPosition('i9')).toBeNull();
      expect(stringToPosition('a0')).toBeNull();
      expect(stringToPosition('invalid')).toBeNull();
    });
  });
});