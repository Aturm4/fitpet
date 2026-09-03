export type ExerciseType = 'squat' | 'pushup' | 'jumpingjack';

export const XP_PER_REP: Record<ExerciseType, number> = {
  squat: 10,
  pushup: 15,
  jumpingjack: 5,
};

export const LEVEL_THRESHOLDS = [0, 150, 400, 800, 1400, 2200];

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export function getXpForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] ?? Infinity;
}

export function getLevelProgress(xp: number): number {
  const level = getLevel(xp);
  const current = LEVEL_THRESHOLDS[level - 1];
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  if (next === current) return 1;
  return Math.min((xp - current) / (next - current), 1);
}
