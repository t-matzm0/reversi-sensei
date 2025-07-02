import { Board, Player, Position } from '@/types/game';
import { BOARD_SIZE } from '@/constants';

export function createInitialBoard(): Board {
  const board: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  const mid = Math.floor(BOARD_SIZE / 2);
  board[mid - 1][mid - 1] = 'white';
  board[mid - 1][mid] = 'black';
  board[mid][mid - 1] = 'black';
  board[mid][mid] = 'white';

  return board;
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getOpponent(player: Player): Player {
  if (player === 'black') return 'white';
  if (player === 'white') return 'black';
  return null;
}

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function getFlippedPieces(
  board: Board,
  row: number,
  col: number,
  player: Player
): Position[] {
  if (!player || board[row][col] !== null) {
    return [];
  }

  const flipped: Position[] = [];
  const opponent = getOpponent(player);

  for (const [dx, dy] of directions) {
    const lineFlipped: Position[] = [];
    let x = row + dx;
    let y = col + dy;

    while (isValidPosition(x, y) && board[x][y] === opponent) {
      lineFlipped.push({ row: x, col: y });
      x += dx;
      y += dy;
    }

    if (lineFlipped.length > 0 && isValidPosition(x, y) && board[x][y] === player) {
      flipped.push(...lineFlipped);
    }
  }

  return flipped;
}

export function isValidMove(board: Board, row: number, col: number, player: Player): boolean {
  return getFlippedPieces(board, row, col, player).length > 0;
}

export function getAllValidMoves(board: Board, player: Player): Position[] {
  const moves: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isValidMove(board, row, col, player)) {
        moves.push({ row, col });
      }
    }
  }

  return moves;
}

export function makeMove(board: Board, row: number, col: number, player: Player): Board {
  const newBoard = board.map((row) => [...row]);
  const flipped = getFlippedPieces(board, row, col, player);

  newBoard[row][col] = player;
  for (const { row: r, col: c } of flipped) {
    newBoard[r][c] = player;
  }

  return newBoard;
}

export function countPieces(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;

  for (const row of board) {
    for (const cell of row) {
      if (cell === 'black') black++;
      else if (cell === 'white') white++;
    }
  }

  return { black, white };
}

export function isGameOver(board: Board): boolean {
  return (
    getAllValidMoves(board, 'black').length === 0 && getAllValidMoves(board, 'white').length === 0
  );
}

export function getWinner(board: Board): Player {
  const { black, white } = countPieces(board);
  if (black > white) return 'black';
  if (white > black) return 'white';
  return null;
}
