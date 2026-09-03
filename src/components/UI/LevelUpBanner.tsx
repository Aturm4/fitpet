import { useEffect, useState } from 'react';
import { useActiveCharacter, useGameStore } from '../../store/gameStore';
import { getStage } from '../../game/characterStages';

export function LevelUpBanner() {
  const { isLevelingUp } = useGameStore();
  const char = useActiveCharacter();
  const [visible, setVisible] = useState(false);
  const level = char?.level ?? 1;
  const stage = getStage(level, char?.type);

  useEffect(() => {
    if (isLevelingUp) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(t);
    }
  }, [isLevelingUp]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className="flex flex-col items-center gap-2 px-8 py-6 rounded-3xl animate-bounce"
        style={{
          background: `${stage.color}22`,
          border: `2px solid ${stage.color}`,
          boxShadow: `0 0 60px ${stage.color}88`,
        }}
      >
        <span className="text-5xl">{stage.emoji}</span>
        <span className="text-2xl font-black text-white">УРОВЕНЬ {level}!</span>
        <span className="text-lg font-bold" style={{ color: stage.color }}>{stage.label}</span>
      </div>
    </div>
  );
}
