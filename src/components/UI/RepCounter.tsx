import { useActiveCharacter } from '../../store/gameStore';
import type { ExerciseType } from '../../game/xpSystem';

interface Props {
  exercise: ExerciseType;
  sessionReps: number;
}

const LABELS: Record<ExerciseType, string> = {
  squat: 'Приседания',
  pushup: 'Отжимания',
  jumpingjack: 'Прыжки',
};

const ICONS: Record<ExerciseType, string> = {
  squat: '🦵',
  pushup: '🤸',
  jumpingjack: '⭐',
};

export function RepCounter({ exercise, sessionReps }: Props) {
  const char = useActiveCharacter();

  return (
    <div className="flex flex-col items-center gap-1 bg-white/5 rounded-2xl border border-white/10 px-5 py-3">
      <span className="text-3xl">{ICONS[exercise]}</span>
      <span className="text-5xl font-black text-white tabular-nums">{sessionReps}</span>
      <span className="text-xs text-white/50">{LABELS[exercise]}</span>
      <span className="text-xs text-white/30">Всего: {char?.repsByExercise[exercise] ?? 0}</span>
    </div>
  );
}
