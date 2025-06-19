import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameSettings {
  showHints: boolean;
  isVsComputer: boolean;
  difficulty: Difficulty;
}

const DEFAULT_SETTINGS: GameSettings = {
  showHints: true,
  isVsComputer: true,
  difficulty: 'medium',
};

export function useGameSettings() {
  const [settings, setSettings] = useLocalStorage<GameSettings>('reversi-settings', DEFAULT_SETTINGS);

  const toggleHints = useCallback(() => {
    setSettings(prev => ({ ...prev, showHints: !prev.showHints }));
  }, [setSettings]);

  const toggleGameMode = useCallback(() => {
    setSettings(prev => ({ ...prev, isVsComputer: !prev.isVsComputer }));
  }, [setSettings]);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setSettings(prev => ({ ...prev, difficulty }));
  }, [setSettings]);

  return {
    showHints: settings.showHints,
    isVsComputer: settings.isVsComputer,
    difficulty: settings.difficulty,
    toggleHints,
    toggleGameMode,
    setDifficulty,
  };
}