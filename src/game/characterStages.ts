import type { BodyShape } from '../components/Character/CharacterSVG';

export type CharacterType = 'fat' | 'skinny';

export interface CharacterStage {
  level: number;
  label: string;
  emoji: string;
  color: string;
  scale: number;
  bodyShape: BodyShape;
}

// Level 1 стадия зависит от типа — остальные одинаковые
const STAGE_FAT: CharacterStage =
  { level: 1, label: 'Диванный герой', emoji: '😴', color: '#f59e0b', scale: 1.3, bodyShape: 'fat' };

const STAGE_SKINNY: CharacterStage =
  { level: 1, label: 'Дрыщ', emoji: '🥢', color: '#f59e0b', scale: 1.0, bodyShape: 'skinny' };

export const CHARACTER_STAGES: CharacterStage[] = [
  STAGE_FAT,
  { level: 2, label: 'Начинающий',   emoji: '🙂', color: '#10b981', scale: 1.1,  bodyShape: 'chubby'   },
  { level: 3, label: 'Середняк',     emoji: '💪', color: '#3b82f6', scale: 1.0,  bodyShape: 'normal'   },
  { level: 4, label: 'Подтянутый',   emoji: '🔥', color: '#8b5cf6', scale: 1.0,  bodyShape: 'fit'      },
  { level: 5, label: 'Атлет',        emoji: '⚡', color: '#f43f5e', scale: 1.05, bodyShape: 'athletic' },
  { level: 6, label: 'Чемпион',      emoji: '🏆', color: '#fbbf24', scale: 1.1,  bodyShape: 'champion' },
];

export function getStage(level: number, characterType: CharacterType = 'fat'): CharacterStage {
  const stage = CHARACTER_STAGES[Math.min(level - 1, CHARACTER_STAGES.length - 1)];
  // На первом уровне форма зависит от типа персонажа
  if (level === 1) return characterType === 'skinny' ? STAGE_SKINNY : STAGE_FAT;
  return stage;
}
