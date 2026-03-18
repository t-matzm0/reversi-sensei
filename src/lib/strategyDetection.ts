import { Board, Position, Player } from '@/types/game';
import { getFlippedPieces, makeMove } from './gameLogic';

export interface StrategyInfo {
  type: 'parity' | 'nakawari' | 'wing' | 'taneishi' | 'stoner';
  name: string;
  description: string;
  isPositive: boolean;
}

interface EdgeDefinition {
  cells: [number, number][];
  corners: [[number, number], [number, number]];
}

const EDGES: EdgeDefinition[] = [
  {
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [0, 7],
    ],
    corners: [
      [0, 0],
      [0, 7],
    ],
  },
  {
    cells: [
      [7, 0],
      [7, 1],
      [7, 2],
      [7, 3],
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 7],
    ],
    corners: [
      [7, 0],
      [7, 7],
    ],
  },
  {
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
      [7, 0],
    ],
    corners: [
      [0, 0],
      [7, 0],
    ],
  },
  {
    cells: [
      [0, 7],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [7, 7],
    ],
    corners: [
      [0, 7],
      [7, 7],
    ],
  },
];

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function countFrontierDiscsForPlayer(board: Board, player: Player): number {
  let count = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== player) continue;
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === null) {
          count++;
          break;
        }
      }
    }
  }
  return count;
}

/** 中割り: 内側の石を取り、境界石を増やさない手法 */
export function detectNakawari(board: Board, move: Position, player: Player): StrategyInfo | null {
  if (!player) return null;
  if (move.row === 0 || move.row === 7 || move.col === 0 || move.col === 7) return null;

  const flipped = getFlippedPieces(board, move.row, move.col, player);
  if (flipped.length === 0) return null;

  const allInterior = flipped.every((p) => p.row > 0 && p.row < 7 && p.col > 0 && p.col < 7);
  if (!allInterior) return null;

  const newBoard = makeMove(board, move.row, move.col, player);
  if (countFrontierDiscsForPlayer(newBoard, player) <= countFrontierDiscsForPlayer(board, player)) {
    return {
      type: 'nakawari',
      name: '中割り',
      description: '内側の石を取っています。境界石を増やさない良い手です',
      isPositive: true,
    };
  }
  return null;
}

function detectWingOnEdge(board: Board, edgeCells: [number, number][], player: Player): boolean {
  const cells = edgeCells.map(([r, c]) => board[r][c]);
  let first = -1;
  let last = -1;
  let cnt = 0;

  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === player) {
      if (first === -1) first = i;
      last = i;
      cnt++;
    }
  }
  if (cnt < 3) return false;
  for (let i = first; i <= last; i++) {
    if (cells[i] !== player) return false;
  }
  const touchesLeft = first === 0;
  const touchesRight = last === cells.length - 1;
  if (touchesLeft && touchesRight) return false;
  return touchesLeft || touchesRight;
}

/** ウイング: 辺に片側のみ伸びる連続した石列（弱い形） */
export function detectWings(board: Board, move: Position, player: Player): StrategyInfo[] {
  if (!player) return [];
  const newBoard = makeMove(board, move.row, move.col, player);
  const result: StrategyInfo[] = [];
  const opponent = player === 'black' ? 'white' : 'black';

  for (const edge of EDGES) {
    const [c1, c2] = edge.corners;
    if (newBoard[c1[0]][c1[1]] !== null || newBoard[c2[0]][c2[1]] !== null) continue;
    const mid = edge.cells.slice(1, 7) as [number, number][];

    if (detectWingOnEdge(newBoard, mid, player) && !detectWingOnEdge(board, mid, player)) {
      result.push({
        type: 'wing',
        name: 'ウイング',
        description: '辺に弱い形（ウイング）ができています。角を取られる危険があります',
        isPositive: false,
      });
    }
    if (detectWingOnEdge(newBoard, mid, opponent) && !detectWingOnEdge(board, mid, opponent)) {
      result.push({
        type: 'wing',
        name: 'ウイング',
        description: '相手に辺のウイングを作らせています',
        isPositive: true,
      });
    }
  }
  return result;
}

export interface ParityRegion {
  cells: Position[];
  size: number;
}

export function findEmptyRegions(board: Board): ParityRegion[] {
  const visited = Array.from({ length: 8 }, () => Array(8).fill(false));
  const regions: ParityRegion[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== null || visited[r][c]) continue;
      const cells: Position[] = [];
      const queue: Position[] = [{ row: r, col: c }];
      visited[r][c] = true;
      while (queue.length > 0) {
        const cur = queue.shift()!;
        cells.push(cur);
        for (const [dr, dc] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nr = cur.row + dr;
          const nc = cur.col + dc;
          if (
            nr >= 0 &&
            nr < 8 &&
            nc >= 0 &&
            nc < 8 &&
            !visited[nr][nc] &&
            board[nr][nc] === null
          ) {
            visited[nr][nc] = true;
            queue.push({ row: nr, col: nc });
          }
        }
      }
      regions.push({ cells, size: cells.length });
    }
  }
  return regions;
}

/** 偶数理論: 終盤の空き領域の偶奇で最後に打てるか判定 */
export function detectParity(board: Board, move: Position, player: Player): StrategyInfo | null {
  if (!player) return null;
  let empty = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === null) empty++;
    }
  }
  if (empty > 14) return null;

  const newBoard = makeMove(board, move.row, move.col, player);
  const regions = findEmptyRegions(newBoard);
  if (regions.length === 0) return null;

  const odd = regions.filter((r) => r.size % 2 === 1).length;
  const even = regions.filter((r) => r.size % 2 === 0).length;

  if (odd > even) {
    return {
      type: 'parity',
      name: '偶数理論',
      description: '奇数空きの領域が' + odd + 'つ。最後に打てる可能性が高い有利な形です',
      isPositive: true,
    };
  }
  if (even > odd && even > 0) {
    return {
      type: 'parity',
      name: '偶数理論',
      description: '偶数空きの領域が' + even + 'つ。相手に最後を打たれやすい形です',
      isPositive: false,
    };
  }
  return null;
}

/** 種石: 相手の石の中に拠点を作り、後で大量に返す戦略 */
export function detectTaneishi(board: Board, move: Position, player: Player): StrategyInfo | null {
  if (!player) return null;
  const opponent = player === 'black' ? 'white' : 'black';
  const newBoard = makeMove(board, move.row, move.col, player);

  let surrOpp = 0;
  let surrSelf = 0;
  let surrEmpty = 0;
  for (const [dr, dc] of DIRECTIONS) {
    const nr = move.row + dr;
    const nc = move.col + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (newBoard[nr][nc] === opponent) surrOpp++;
      else if (newBoard[nr][nc] === player) surrSelf++;
      else surrEmpty++;
    }
  }

  const flipped = getFlippedPieces(board, move.row, move.col, player);
  if (flipped.length > 2 || surrOpp < 4 || surrSelf > 2 || surrEmpty > 2) return null;

  let potential = 0;
  for (const [dr, dc] of DIRECTIONS) {
    let nr = move.row + dr;
    let nc = move.col + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && newBoard[nr][nc] === opponent) {
      potential++;
      nr += dr;
      nc += dc;
    }
  }
  if (potential >= 4) {
    return {
      type: 'taneishi',
      name: '種石',
      description: '相手の石の中に拠点を作っています。後で大量に返せる可能性があります',
      isPositive: true,
    };
  }
  return null;
}

/** ストーナー: 辺の相手の石列の端に打ち、角を狙う戦術 */
export function detectStoner(board: Board, move: Position, player: Player): StrategyInfo | null {
  if (!player) return null;
  const opponent = player === 'black' ? 'white' : 'black';
  if (move.row !== 0 && move.row !== 7 && move.col !== 0 && move.col !== 7) return null;

  for (const edge of EDGES) {
    if (!edge.cells.some(([r, c]) => r === move.row && c === move.col)) continue;
    const moveIdx = edge.cells.findIndex(([r, c]) => r === move.row && c === move.col);

    for (const [cIdx, corner] of [
      [0, edge.corners[0]],
      [7, edge.corners[1]],
    ] as [number, [number, number]][]) {
      if (board[corner[0]][corner[1]] !== null) continue;
      const lo = Math.min(moveIdx, cIdx);
      const hi = Math.max(moveIdx, cIdx);
      if (hi - lo < 2) continue;

      let oppCnt = 0;
      let allOpp = true;
      for (let i = lo + 1; i < hi; i++) {
        const [r, c] = edge.cells[i];
        if (board[r][c] === opponent) oppCnt++;
        else {
          allOpp = false;
          break;
        }
      }

      if (allOpp && oppCnt >= 2) {
        const flipped = getFlippedPieces(board, move.row, move.col, player);
        if (flipped.some((p) => edge.cells.some(([r, c]) => r === p.row && c === p.col))) {
          return {
            type: 'stoner',
            name: 'ストーナー',
            description: '辺の相手の石列を攻めて角を狙える形です',
            isPositive: true,
          };
        }
      }
    }
  }
  return null;
}

export function detectAllStrategies(board: Board, move: Position, player: Player): StrategyInfo[] {
  if (!player) return [];
  const strategies: StrategyInfo[] = [];

  const nakawari = detectNakawari(board, move, player);
  if (nakawari) strategies.push(nakawari);

  strategies.push(...detectWings(board, move, player));

  const parity = detectParity(board, move, player);
  if (parity) strategies.push(parity);

  const taneishi = detectTaneishi(board, move, player);
  if (taneishi) strategies.push(taneishi);

  const stoner = detectStoner(board, move, player);
  if (stoner) strategies.push(stoner);

  return strategies;
}
