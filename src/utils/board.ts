import { Position } from '@/types/game';
import { BOARD_SIZE } from '@/constants';

/**
 * Convert board position to algebraic notation (e.g., {row: 0, col: 0} -> "A1")
 */
export function positionToAlgebraic(position: Position): string {
  return `${String.fromCharCode(65 + position.col)}${position.row + 1}`;
}

/**
 * Convert algebraic notation to board position (e.g., "A1" -> {row: 0, col: 0})
 */
export function algebraicToPosition(notation: string): Position | null {
  if (notation.length !== 2) return null;
  
  const col = notation.charCodeAt(0) - 65;
  const row = parseInt(notation[1]) - 1;
  
  if (col < 0 || col >= BOARD_SIZE || row < 0 || row >= BOARD_SIZE || isNaN(row)) {
    return null;
  }
  
  return { row, col };
}

/**
 * Check if two positions are equal
 */
export function arePositionsEqual(pos1: Position | null | undefined, pos2: Position | null | undefined): boolean {
  if (!pos1 || !pos2) return false;
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

/**
 * Get all corner positions
 */
export function getCornerPositions(): Position[] {
  return [
    { row: 0, col: 0 },
    { row: 0, col: BOARD_SIZE - 1 },
    { row: BOARD_SIZE - 1, col: 0 },
    { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 },
  ];
}

/**
 * Check if a position is a corner
 */
export function isCornerPosition(position: Position): boolean {
  return getCornerPositions().some(corner => arePositionsEqual(corner, position));
}

/**
 * Get all edge positions (excluding corners)
 */
export function getEdgePositions(): Position[] {
  const edges: Position[] = [];
  
  for (let i = 1; i < BOARD_SIZE - 1; i++) {
    edges.push({ row: 0, col: i });
    edges.push({ row: BOARD_SIZE - 1, col: i });
    edges.push({ row: i, col: 0 });
    edges.push({ row: i, col: BOARD_SIZE - 1 });
  }
  
  return edges;
}

/**
 * Check if a position is an edge (excluding corners)
 */
export function isEdgePosition(position: Position): boolean {
  if (isCornerPosition(position)) return false;
  
  return (
    position.row === 0 ||
    position.row === BOARD_SIZE - 1 ||
    position.col === 0 ||
    position.col === BOARD_SIZE - 1
  );
}

/**
 * Check if a position is valid (within board bounds)
 */
export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Get all adjacent positions around a given position
 */
export function getAdjacentPositions(row: number, col: number): Position[] {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  const adjacent: Position[] = [];
  
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (isValidPosition(newRow, newCol)) {
      adjacent.push({ row: newRow, col: newCol });
    }
  }
  
  return adjacent;
}

/**
 * Convert position to string notation (e.g., {row: 0, col: 0} -> "a1")
 */
export function positionToString(position: Position): string {
  return `${String.fromCharCode(97 + position.col)}${position.row + 1}`;
}

/**
 * Convert string notation to position (e.g., "a1" -> {row: 0, col: 0})
 */
export function stringToPosition(notation: string): Position | null {
  if (notation.length !== 2) return null;
  
  const col = notation.charCodeAt(0) - 97;
  const row = parseInt(notation[1]) - 1;
  
  if (!isValidPosition(row, col) || isNaN(row)) {
    return null;
  }
  
  return { row, col };
}

/**
 * Get board symmetry for a position
 */
export function getBoardSymmetry(position: Position): Position[] {
  const { row, col } = position;
  const maxIdx = BOARD_SIZE - 1;
  
  return [
    position,
    { row, col: maxIdx - col },
    { row: maxIdx - row, col },
    { row: maxIdx - row, col: maxIdx - col },
  ];
}