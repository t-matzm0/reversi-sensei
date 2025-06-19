import { Player, GameState } from '@/types/game';

/**
 * Format player name for display
 */
export function formatPlayerName(player: Player | null, isJapanese: boolean = true): string {
  if (!player) return '';

  if (isJapanese) {
    return player === 'black' ? '黒' : '白';
  }

  return player === 'black' ? 'Black' : 'White';
}

/**
 * Get game status message
 */
export function getGameStatusMessage(gameState: GameState, isJapanese: boolean = true): string {
  if (gameState.gameOver) {
    if (gameState.winner === null) {
      return isJapanese ? '引き分け！' : 'Draw!';
    }
    const winnerName = formatPlayerName(gameState.winner, isJapanese);
    return isJapanese ? `${winnerName}の勝利！` : `${winnerName} wins!`;
  }

  if (!gameState.currentPlayer) {
    return '';
  }

  const currentPlayerName = formatPlayerName(gameState.currentPlayer, isJapanese);
  return isJapanese ? `${currentPlayerName}のターン` : `${currentPlayerName}'s turn`;
}

/**
 * Calculate score difference
 */
export function getScoreDifference(
  blackScore: number,
  whiteScore: number
): {
  difference: number;
  leader: Player | null;
} {
  const difference = Math.abs(blackScore - whiteScore);

  if (blackScore > whiteScore) {
    return { difference, leader: 'black' };
  } else if (whiteScore > blackScore) {
    return { difference, leader: 'white' };
  }

  return { difference: 0, leader: null };
}
