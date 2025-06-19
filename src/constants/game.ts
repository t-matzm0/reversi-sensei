export const BOARD_SIZE = 8;

export const INITIAL_SCORES = {
  black: 2,
  white: 2,
} as const;

export const AI_MOVE_DELAY = 1000; // milliseconds

export const POSITION_WEIGHTS = [
  [100, -20, 10, 5, 5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10, 5, 5, 10, -20, 100]
] as const;

export const DIFFICULTY_SETTINGS = {
  easy: {
    depth: 1,
    randomness: 0.3,
  },
  medium: {
    depth: 3,
    randomness: 0.1,
  },
  hard: {
    depth: 5,
    randomness: 0,
  },
} as const;

export const ANIMATION_DURATION = 200; // milliseconds

export const COLORS = {
  board: {
    background: '#14532d',
    grid: '#1e40af',
  },
  pieces: {
    black: '#000000',
    white: '#ffffff',
  },
  hints: {
    valid: 'rgba(34, 197, 94, 0.5)',
  },
  lastMove: {
    highlight: 'rgba(251, 191, 36, 0.5)',
  },
} as const;