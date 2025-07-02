import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameSettings {
  showHints: boolean;
  showEvaluations: boolean;
  isVsComputer: boolean;
  difficulty: Difficulty;
  allowUndo: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  showHints: true,
  showEvaluations: false,
  isVsComputer: true,
  difficulty: 'medium',
  allowUndo: true,
};

export function useGameSettings() {
  const [settings, setSettings] = useLocalStorage<GameSettings>(
    'reversi-settings',
    DEFAULT_SETTINGS
  );

  const toggleHints = useCallback(() => {
    setSettings((prev) => ({ ...prev, showHints: !prev.showHints }));
  }, [setSettings]);

  const toggleEvaluations = useCallback(() => {
    setSettings((prev) => ({ ...prev, showEvaluations: !prev.showEvaluations }));
  }, [setSettings]);

  const toggleGameMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, isVsComputer: !prev.isVsComputer }));
  }, [setSettings]);

  const setDifficulty = useCallback(
    (difficulty: Difficulty) => {
      setSettings((prev) => ({ ...prev, difficulty }));
    },
    [setSettings]
  );

  const toggleAllowUndo = useCallback(() => {
    setSettings((prev) => ({ ...prev, allowUndo: !prev.allowUndo }));
  }, [setSettings]);

  return {
    showHints: settings.showHints,
    showEvaluations: settings.showEvaluations,
    isVsComputer: settings.isVsComputer,
    difficulty: settings.difficulty,
    allowUndo: settings.allowUndo,
    toggleHints,
    toggleEvaluations,
    toggleGameMode,
    setDifficulty,
    toggleAllowUndo,
  };
}
