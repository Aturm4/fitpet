import { useActiveCharacter } from '../../store/gameStore';
import type { ExerciseType } from '../../game/xpSystem';
import { getStage } from '../../game/characterStages';
import { CharacterSVG } from '../Character/CharacterSVG';

interface Props { onClose: () => void }

function getLast28Days(): string[] {
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().slice(0, 10);
  });
}

function pluralDays(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'день';
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'дня';
  return 'дней';
}

const EXERCISES: { key: ExerciseType; label: string; emoji: string; color: string }[] = [
  { key: 'squat',       label: 'Приседания', emoji: '🏋️', color: '#3b82f6' },
  { key: 'pushup',      label: 'Отжимания',  emoji: '💪', color: '#8b5cf6' },
  { key: 'jumpingjack', label: 'Прыжки',     emoji: '⚡', color: '#10b981' },
];

function StatCard({ emoji, value, label, color }: { emoji: string; value: string | number; label: string; color: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-2xl"
      style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
      <span className="text-xl">{emoji}</span>
      <span className="text-2xl font-black text-white leading-none">{value}</span>
      <span className="text-xs text-white/40 mt-0.5">{label}</span>
    </div>
  );
}

export function StatsModal({ onClose }: Props) {
  const char = useActiveCharacter();
  if (!char) return null;

  const stage = getStage(char.level, char.type);
  const daysPlaying = Math.max(1, Math.floor((Date.now() - char.createdAt) / 86_400_000) + 1);
  const last28 = getLast28Days();
  const history = char.dailyHistory ?? {};

  const maxExReps = Math.max(1, ...EXERCISES.map(e => char.repsByExercise[e.key] ?? 0));
  const maxDayReps = Math.max(1, ...last28.map(d => history[d] ?? 0));

  // Intensity 0-3 for coloring calendar cells
  function intensity(reps: number): number {
    if (reps === 0) return 0;
    if (reps < 20) return 1;
    if (reps < 60) return 2;
    return 3;
  }
  const cellColors = ['rgba(255,255,255,0.06)', '#1e3a8a', '#2563eb', '#60a5fa'];

  // Weekly day labels — show Mon above first Monday in range
  const weekDays = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl overflow-y-auto"
        style={{ background: '#161b2e', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/8">
          <CharacterSVG shape={stage.bodyShape} color={stage.color} size={56} />
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">{char.name}</h2>
            <p className="text-sm font-medium" style={{ color: stage.color }}>
              {stage.emoji} {stage.label} · Ур. {char.level}
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-2xl leading-none px-1">×</button>
        </div>

        <div className="flex flex-col gap-5 p-5">

          {/* Big stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard emoji="💪" value={char.totalReps} label="Всего репов" color="#3b82f6" />
            <StatCard emoji="⭐" value={char.xp} label="Очков XP" color="#f59e0b" />
            <StatCard emoji="🔥" value={`${char.streak} ${pluralDays(char.streak)}`} label="Текущий стрик" color="#f97316" />
            <StatCard emoji="🏆" value={`${char.bestStreak} ${pluralDays(char.bestStreak)}`} label="Лучший стрик" color="#fbbf24" />
            <StatCard emoji="📅" value={daysPlaying} label="Дней в игре" color="#6366f1" />
            <StatCard emoji="🎯" value={`${char.todayReps}/${char.dailyGoal}`} label="Сегодня" color="#10b981" />
          </div>

          {/* Exercise breakdown */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest">По упражнениям</h3>
            {EXERCISES.map(ex => {
              const reps = char.repsByExercise[ex.key] ?? 0;
              const pct = reps / maxExReps;
              return (
                <div key={ex.key} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">{ex.emoji} {ex.label}</span>
                    <span className="font-bold text-white">{reps} <span className="text-white/30 font-normal text-xs">реп</span></span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct * 100}%`, background: `linear-gradient(90deg, ${ex.color}, ${ex.color}bb)`, boxShadow: `0 0 8px ${ex.color}66` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity calendar */}
          <div className="flex flex-col gap-2">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest">Активность — 28 дней</h3>

            {/* Week day labels */}
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {weekDays.map(d => (
                <div key={d} className="text-center text-white/25 text-[9px] font-medium">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {/* Offset to start on correct weekday */}
              {Array.from({ length: (new Date(last28[0]).getDay() + 6) % 7 }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {last28.map(day => {
                const reps = history[day] ?? 0;
                const lvl = intensity(reps);
                return (
                  <div key={day} className="rounded-md aspect-square relative group"
                    style={{ background: cellColors[lvl] }}>
                    {reps > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/60">
                        {reps}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-[10px] text-white/30">
              <span>меньше</span>
              {cellColors.map((c, i) => (
                <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ background: c }} />
              ))}
              <span>больше</span>
            </div>
          </div>

          {/* Most active day */}
          {maxDayReps > 1 && (() => {
            const bestDay = last28.reduce((a, b) => (history[a] ?? 0) >= (history[b] ?? 0) ? a : b);
            const bestReps = history[bestDay] ?? 0;
            if (bestReps === 0) return null;
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <span className="text-2xl">🌟</span>
                <div>
                  <div className="text-white font-bold text-sm">Лучший день</div>
                  <div className="text-white/50 text-xs">
                    {new Date(bestDay).toLocaleDateString('ru-RU', { day:'numeric', month:'long' })} — {bestReps} репов
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Bottom safe area */}
        <div className="h-6" />
      </div>
    </div>
  );
}
