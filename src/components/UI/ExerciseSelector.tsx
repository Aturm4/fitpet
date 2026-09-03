import type { ExerciseType } from '../../game/xpSystem';

interface Props {
  current: ExerciseType;
  onChange: (e: ExerciseType) => void;
}

const EXERCISES: { id: ExerciseType; label: string; icon: string; xp: number; color: string }[] = [
  { id: 'squat', label: 'Приседания', icon: '🦵', xp: 10, color: '#3b82f6' },
  { id: 'pushup', label: 'Отжимания', icon: '🤸', xp: 15, color: '#8b5cf6' },
  { id: 'jumpingjack', label: 'Прыжки', icon: '⭐', xp: 5, color: '#10b981' },
];

export function ExerciseSelector({ current, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {EXERCISES.map((ex) => {
        const active = current === ex.id;
        return (
          <button
            key={ex.id}
            onClick={() => onChange(ex.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-xl border transition-all"
            style={{
              background: active ? `${ex.color}33` : `${ex.color}12`,
              borderColor: active ? ex.color : `${ex.color}30`,
              boxShadow: active ? `0 0 14px ${ex.color}55` : 'none',
              transform: active ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span className="text-xl">{ex.icon}</span>
            <span className="text-xs font-medium" style={{ color: active ? '#fff' : `${ex.color}cc` }}>
              {ex.label}
            </span>
            <span className="text-xs" style={{ color: active ? `${ex.color}dd` : `${ex.color}88` }}>
              +{ex.xp} XP
            </span>
          </button>
        );
      })}
    </div>
  );
}
