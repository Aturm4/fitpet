import { useState } from 'react';
import { useActiveCharacter, useGameStore } from '../../store/gameStore';

const PRESETS = [
  { label: 'Лёгкая', value: 30, emoji: '🌱', desc: '30 репов в день' },
  { label: 'Средняя', value: 50, emoji: '💪', desc: '50 репов в день' },
  { label: 'Хардкор', value: 100, emoji: '🔥', desc: '100 репов в день' },
];

function pluralDays(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'дня';
  return 'дней';
}

export function DailyGoalBar() {
  const char = useActiveCharacter();
  const { setDailyGoal } = useGameStore();
  const [showPicker, setShowPicker] = useState(false);

  if (!char) return null;

  const goal = char.dailyGoal;
  const done = char.todayReps;
  const pct = Math.min(done / goal, 1);
  const met = done >= goal;

  return (
    <>
      <div
        className="flex flex-col gap-1.5 px-4 py-2.5 rounded-2xl cursor-pointer select-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={() => setShowPicker(true)}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">🎯 Цель дня</span>
          {char.streak > 0 && (
            <span className="text-xs font-bold text-orange-400">
              🔥 {char.streak} {pluralDays(char.streak)}
            </span>
          )}
        </div>

        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct * 100}%`,
              background: met
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : 'linear-gradient(90deg, #3b82f6, #818cf8)',
              boxShadow: met ? '0 0 8px #22c55e88' : 'none',
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-bold" style={{ color: met ? '#4ade80' : 'rgba(255,255,255,0.7)' }}>
            {done} / {goal} реп{met ? ' ✅' : ''}
          </span>
          <span className="text-white/25 text-[10px]">нажми чтобы изменить</span>
        </div>
      </div>

      {showPicker && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowPicker(false)}
        >
          <div
            className="w-full max-w-xs flex flex-col gap-3 p-5 rounded-3xl"
            style={{ background: '#1a1f30', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-black text-center text-base">Дневная цель</h3>
            {PRESETS.map((p) => {
              const active = goal === p.value;
              return (
                <button
                  key={p.value}
                  className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                  style={{
                    background: active ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${active ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  }}
                  onClick={() => { setDailyGoal(char.id, p.value); setShowPicker(false); }}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">{p.label}</div>
                    <div className="text-white/40 text-xs">{p.desc}</div>
                  </div>
                  {active && <span className="text-blue-400 text-sm font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
