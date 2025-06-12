export type Player = 'black' | 'white' | null;
export type Board = Player[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move extends Position {
  player: Player;
  flippedPieces: Position[];
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  history: Move[];
  blackScore: number;
  whiteScore: number;
  gameOver: boolean;
  winner: Player;
  possibleMoves: Position[];
}

export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  showHints: boolean;
  animationSpeed: 'fast' | 'normal' | 'slow';
}